const ports = require('@social/social-deployment/topology/portMaps');
const zmq = require('zmq');

const publisher = zmq.socket('pub');

publisher.bindSync(`tcp://127.0.0.1:${ports.pubsub}`);

function makeProxy(service) {
    const listener = zmq.socket('pull');
    listener.connect(`tcp://127.0.0.1:${ports[service].pubsub}`);
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
