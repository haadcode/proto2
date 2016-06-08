'use strict';

const IpfsApi = require('exports?Ipfs!ipfs/dist/index.js');
const Promise = require('bluebird');
const Logger  = require('logplease');
const logger  = Logger.create("orbit-db example", { color: Logger.Colors.Green, showTimestamp: false, showLevel: false });
const OrbitDB = require('orbit-db');

const host     = '178.62.241.75'
const port     = 3333;
const username = 'Peer';
const channel  = 'upgradetheinternet';
const key      = 'greeting';
const value    = 'Hello world';

const ipfsDaemon = (IPFS, repo, signalServerAddress) => {
  repo = repo || '/tmp/orbit';
  console.log("Signalling server: " + signalServerAddress);
  signalServerAddress = signalServerAddress || '178.62.241.75';
  console.log("IPFS Path: " + repo);
  const ipfs = new IPFS(repo);
  return new Promise((resolve, reject) => {
    ipfs.init({}, (err) => {
      if (err) {
        if (err.message === 'repo already exists') {
          console.log(repo, err.message)
          return resolve();
        }
        return reject(err);
      }
      resolve();
    })
  })
  .then(() => {
    return new Promise((resolve, reject) => {
      ipfs.goOnline(() => {
        resolve(ipfs);
      });
    });
  })
  .then((id) => {
    return new Promise((resolve, reject) => {
      ipfs.config.show((err, config) => {
        if (err) return reject(err);
        resolve(config);
      });
    });
  })
  .then(() => {
    return new Promise((resolve, reject) => {
      ipfs.id((err, id) => {
        if (err) return reject(err);
        resolve(id);
      });
    });
  })
  .then((id) => new Promise((resolve, reject) => {
    ipfs.config.show((err, config) => {
      if (err) return reject(err);
      const signallingServer = `/libp2p-webrtc-star/ip4/${signalServerAddress}/tcp/9090/ws`; // localhost
      config.Addresses.Swarm = [`${signallingServer}/ipfs/${id.ID}`];
      ipfs.config.replace(config, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }))
  .then(() => {
    return new Promise((resolve, reject) => {
      ipfs.goOffline(resolve);
    });
  })
  .then(() => {
    return new Promise((resolve, reject) => {
      ipfs.goOnline(() => {
        resolve(ipfs);
      });
    });
  })
  .then(() => {
    return new Promise((resolve, reject) => {
      ipfs.id((err, id) => {
        if (err) return reject(err);
        resolve(id);
      });
    });
  })
  .then((id) => {
    return new Promise((resolve, reject) => {
      ipfs.config.show((err, config) => {
        if (err) return reject(err);
        resolve(config);
      });
    });
  })
  .then(() => {
    console.log("IPFS", ipfs)
    return ipfs;
  })
}

let ipfs, orbit;
const peers = ['/tmp/proto2-1', '/tmp/proto2-2'];
Promise.map(peers, (peer, index) => {
  return ipfsDaemon(IpfsApi, peer)
    .then((ipfs) => OrbitDB.connect(null, username + ((index+1) % 2 !== 0 ? 'A' : 'B'), '', ipfs))
}, { concurrency: 1 })
  .then((res) => {
    Promise.map(res, (orbit, index) => {
      return orbit.kvstore(channel, { maxHistory: 5 })
        .then((db) => window.onOrbitDBReady(res[index], db))
    }, { concurrency : 1 });
  });
