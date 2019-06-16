const config = require('config');
const zmq = require('zmq');

const network = config.get('network');
const publisher = zmq.socket('pub');
console.log('zmq publisher: ', `tcp://${network.pubsub.host}:${network.pubsub.port}`);
publisher.bindSync(`tcp://${network.pubsub.host}:${network.pubsub.port}`);

function makeProxy(service) {
    const listener = zmq.socket('pull');
    console.log(`${service} listener: `, `tcp://${network[service].host}:${network[service].publish}`);
    listener.connect(`tcp://${network[service].host}:${network[service].publish}`);
    listener.on('message', (msg) => {
        try {
            const message = JSON.parse(msg.toString());
            publisher.send(message);
        } catch (err) {
            console.log(err);
        }
    });
}
const microServices = ['persistance', 'users', 'activities'];

microServices.forEach((service) => {
    makeProxy(service);
});
