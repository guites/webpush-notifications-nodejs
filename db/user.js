const Sequelize = require('sequelize');
const database = require('./db');

const User = database.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  endpoint: {
    type: Sequelize.STRING,
    allowNull: false
  },
  expirationTime: {
    type: Sequelize.STRING
  },
  keys_auth: {
    type: Sequelize.STRING,
    allowNull: false
  },
  keys_p256dh: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = User;


/* example subscription objects from firefox and google chrome
ffSubscriptionObject = {
    "endpoint": "https://updates.push.services.mozilla.com/wpush/v2/gAAAAABhqBVHpNZa9BlewZ4Yj2oS4Brs79BTPp-cD7ynVhcu94tXe3dDjbc59ButeCLvN4InLLNNlOP0ryJuUXJYNadKrdqnkBBT36t1HWhg1hV_-8jtoJGiJHtJEKD-9vsBmUUeFYZC0zNKQrRQudwXxy7UPKgEHgc0cmTIyzox4ECT_vAyDiM",
    "keys": {
      "auth": "HnawsMtgZrrZOQ8XpY3aWQ",
      "p256dh": "BMyqtc6-hnPoX86ysRu6sSiIghc5bvZD2DGNw86SU1lMhV8TP5VggS2b9pBZBFBG3MXOPmM81sGj8mU5re8SGdw"
    }
  };

  gcSubscriptionObject = {
    "endpoint": "https://fcm.googleapis.com/fcm/send/c--XWzRPZqg:APA91bFcqlg6eFJvf4dO-TM6Ow4pIlSOxdzE1hvxQmKcCt8r06erp1cbjcdIiurWE44cmkAjrNlK5P-I377imtW70rZFkPQkfhB64edKpDBo5Z6upzwyMR8r_D-WuPP3gjEOMGvi-E0x",
    "expirationTime": null,
    "keys": {
        "p256dh": "BPpLKhZrv0rkEC27yIESijN3EPFBfEfH9XJaz8VN8QXiPHBSA8AF5Kv2hErpfn7mJUeIn3FoWXaM5tDbH0UGYxU",
        "auth": "041sPkjXboR1gig3vKHhBg"
    }
};
*/