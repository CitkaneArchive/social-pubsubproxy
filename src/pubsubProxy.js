const config = require('config');

// eslint-disable-next-line no-underscore-dangle
global.__network = config.get('network');

const zmq = require('zmq');

const publisher = zmq.socket('pub');
console.log('zmq publisher: ', `tcp://${__network.pubsub.host}:${__network.pubsub.port}`);
publisher.bindSync(`tcp://${__network.pubsub.host}:${__network.pubsub.port}`);

function makeProxy(service) {
    const listener = zmq.socket('pull');
    console.log(`${service} listener: `, `tcp://${__network[service].host}:${__network[service].publish}`);
    listener.connect(`tcp://${__network[service].host}:${__network[service].publish}`);
    listener.on('message', (msg) => {
        try {
            const message = JSON.parse(msg.toString());
            publisher.send(message);
        } catch (err) {
            console.log(err);
        }
    });
}
const microServices = ['persistance', 'users', 'images'];

microServices.forEach((service) => {
    makeProxy(service);
});
