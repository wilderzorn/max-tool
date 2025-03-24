import type { MqttClient, IClientOptions, ISubscriptionMap } from 'mqtt';
import mqtt from 'mqtt';
import { mqttUrl } from '../../../config/urlConfig';
import { s16 } from './utils';
import { last } from 'es-toolkit';

type EventCallback = (data: any, key: string, lastTopicPart: string) => void;
type ReconnectCallback = (m: string) => void;

interface EventItem {
  topic: string | string[];
  func?: EventCallback;
  topicWildcard: string;
}

class MqttCenter {
  private client: MqttClient | null = null;
  private isFirstConnect: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private events: Map<string, EventItem> = new Map();
  private reEvents: Map<string, ReconnectCallback> = new Map();
  private topicData: Record<string, number> = {};

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public connect(
    username: string = 'username',
    password: string = 'password',
    url: string = mqttUrl,
    otherOpts: IClientOptions = {},
  ): void {
    this.end();
    const clientId = s16();
    this.client = mqtt.connect(url, {
      username,
      password,
      clientId,
      clean: false,
      ...otherOpts,
    });
    this.client.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('connect');
      if (!this.isFirstConnect) {
        this.isFirstConnect = true;
        this.client?.on('message', (topic, message) => {
          this.handleClientMessage(topic, message);
        });
      } else {
        this.reEvents.forEach((callback, key) => {
          callback?.(key);
        });
      }
    });
    this.timer = setInterval(() => {
      if (!this.client?.connected) {
        // eslint-disable-next-line no-console
        console.log('Connection lost');
      }
    }, 1000 * 5);
    this.client.on('error', (error: Error) => {
      // eslint-disable-next-line no-console
      console.log('MQTT Error:', error);
    });
  }

  private handleClientMessage(topic: string, data: Buffer): void {
    try {
      const msg =
        data.length > 2000
          ? Buffer.from(data).toString('utf-8')
          : data.toString('utf-8');
      const res = JSON.parse(decodeURIComponent(encodeURIComponent(msg)));
      this.events.forEach((value, key) => {
        const topics = Array.isArray(value.topic) ? value.topic : [value.topic];
        const lastTopicPart = last(topic.split('/')) || '';
        if (value.topic.includes('#') && topic.includes(value.topicWildcard)) {
          value.func?.(res, key, lastTopicPart);
        } else if (topics.includes(topic)) {
          value.func?.(res, key, lastTopicPart);
        }
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Message processing error:', e);
    }
  }

  public subscribeReconnect(keyVal: string, callback: ReconnectCallback): void {
    if (!this.client || this.reEvents.has(keyVal)) return;
    this.reEvents.set(keyVal, callback);
  }

  public unsubscribeReconnect(keyVal: string): void {
    if (!this.client) return;
    this.reEvents.delete(keyVal);
  }

  public end(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
    this.reEvents.clear();
    this.isFirstConnect = false;
    this.clearTimer();
    this.topicData = {};
    this.events.clear();
  }

  public subscribe(
    messageType: string,
    topic: string | string[],
    callback: EventCallback,
    topicWildcard: string = '',
  ): void {
    if (!this.client) return;

    const topics = Array.isArray(topic) ? topic : [topic];
    const subscriptionMap: ISubscriptionMap = {};

    topics.forEach((t) => {
      if (!this.topicData[t]) {
        subscriptionMap[t] = { qos: 0 };
        this.topicData[t] = 1;
      } else {
        this.topicData[t]++;
      }
    });

    if (Object.keys(subscriptionMap).length > 0) {
      this.client.subscribe(subscriptionMap);
    }

    this.events.set(messageType, {
      topic,
      func: callback,
      topicWildcard,
    });
  }

  public unsubscribe(messageType: string): void {
    if (!this.client) return;
    const obj = this.events.get(messageType);
    if (!obj) return;
    const topics = Array.isArray(obj.topic) ? obj.topic : [obj.topic];
    topics.forEach((t) => {
      const count = this.topicData[t] || 0;
      if (count - 1 <= 0) {
        this.client?.unsubscribe(t);
        delete this.topicData[t];
      } else {
        this.topicData[t] = count - 1;
      }
    });
    this.events.delete(messageType);
  }

  private static instance: MqttCenter;
  public static getInstance(): MqttCenter {
    if (!MqttCenter.instance) {
      MqttCenter.instance = new MqttCenter();
    }
    return MqttCenter.instance;
  }
}

const mqttCenter = MqttCenter.getInstance();
export default mqttCenter;
