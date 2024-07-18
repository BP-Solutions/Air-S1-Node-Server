import mqtt from 'mqtt';
import {InfluxDB, Point} from '@influxdata/influxdb-client'

import { app, PORT } from './api/api.js';

const url = 'http://10.0.0.101:8086'
const token = "NV_gZSAnEr84kmflYNg1c1YpiquuLabEPGVHxUmDQ7x4GxmVKmBEtn0L8kG-NU1S05lxer59ohEpqfHZgiJBmw=="

const client2 = new InfluxDB({url, token})
let org = `birdpump`
let bucket = `test`
let writeClient = client2.getWriteApi(org, bucket, 'ns')

// Define the MQTT broker URL and the topic you want to subscribe to
const brokerUrl = 'mqtt://10.0.0.101';
const topic = 'sensors-v1/nodes';

// Create an MQTT client
const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
    console.log(`Connected to MQTT broker at ${brokerUrl}`);

    // Subscribe to the specified topic
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
        // Parse the JSON message
        const data = JSON.parse(message.toString());
        // console.log(`Received message from ${topic}:`, data);

        let point = new Point('measurement2')
            .tag('tagname1', 'tagvalue1')
            .intField('field1', data.readings.co2)

        writeClient.writePoint(point)
        writeClient.flush();  // Ensure immediate write

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