import mqtt from 'mqtt';
import {InfluxDB, Point} from '@influxdata/influxdb-client'

import { app, PORT } from './api/api.js';

const url = 'http://10.0.0.101:8086'
const token = "NV_gZSAnEr84kmflYNg1c1YpiquuLabEPGVHxUmDQ7x4GxmVKmBEtn0L8kG-NU1S05lxer59ohEpqfHZgiJBmw=="
const client2 = new InfluxDB({url, token})
let org = `birdpump`
let bucket = `test`
let writeClient = client2.getWriteApi(org, bucket, 'ns')


const brokerUrl = 'mqtt://10.0.0.101';
const topic = 'sensors-v1/nodes';
const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
    console.log(`Connected to MQTT broker at ${brokerUrl}`);
    client.subscribe(topic, (err) => {
        if (err) {
            console.error(`Failed to subscribe to topic ${topic}:`, err);
        } else {
            console.log(`Subscribed to topic ${topic}`);
        }
    });
});

client.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());

        const timestamp = new Date(data.timestamp);

        let point = new Point(data.deviceID)
            .timestamp(timestamp)
            .tag('deviceID', data.deviceID)
            .intField('co2', data.readings.co2)
            .floatField('pm1p0', data.readings.pm1p0)
            .floatField('pm2p5', data.readings.pm2p5)
            .floatField('pm4p0', data.readings.pm4p0)
            .floatField('pm10p0', data.readings.pm10p0)
            .intField('voc', data.readings.voc)
            .intField('temperature', data.readings.temperature)
            .intField('humidity', data.readings.humidity)

            .stringField('uptime', data.deviceTelemetry.uptime); // Add uptime as a string field

        writeClient.writePoint(point)
        writeClient.flush();

    } catch (err) {
        console.error(`Failed to parse message from ${topic}:`, err);
    }

    console.log("wrote point")
});

client.on('error', (err) => {
    console.error('MQTT client error:', err);
});

client.on('close', () => {
    console.log('MQTT client disconnected');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});