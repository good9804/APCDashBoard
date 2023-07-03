var express = require("express");
const moment = require("moment");
var router = express.Router();
const Storage = require("../models/storage");
require("dotenv").config();

var firebase = require("firebase/compat/app");
require("firebase/compat/database");

const firebaseConfig = {
  apiKey: process.env.apiKey,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

router.get("/api/view", async (req, res) => {
  try {
    const storage_info = await Storage.find({});
    storage_info.sort(function (a, b) {
      return a.zone_number - b.zone_number;
    });
    res.json({ message: "success!", storage_info: storage_info });
  } catch (err) {
    res.send(err);
  }
});

router.post("/api/upload", async (req, res) => {
  try {
    const check_zone = await Storage.findOne({
      zone_number: req.body.new_zone_info.zone_number,
    });
    if (!check_zone) {
      const new_storage = new Storage({
        zone_number: req.body.new_zone_info.zone_number,
      });
      await new_storage.save();
    }
    const check_sector_number = await Storage.findOne({
      zone_number: req.body.new_zone_info.zone_number,
    });

    const check_sector = await Storage.findOne({
      zone_number: req.body.new_zone_info.zone_number,
      sector: {
        $elemMatch: {
          sector_number: req.body.new_zone_info.sector_number,
        },
      },
    });
    if (
      check_sector_number.sector.length + 1 !=
      req.body.new_zone_info.sector_number
    ) {
      res.json({ message: "이전 섹터를 먼저 추가하세요!" });
    } else {
      if (!check_sector) {
        const new_sector = await Storage.findOne({
          zone_number: req.body.new_zone_info.zone_number,
        });

        await new_sector.sector.push({
          sector_number: req.body.new_zone_info.sector_number,
          grade: req.body.new_zone_info.grade,
        });

        await new_sector.save();
      }

      const storage_info = await Storage.find({});
      res.json({ message: "success!", storage_info: storage_info });
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/api/update", async (req, res) => {
  try {
    const check_zone = await Storage.findOne({
      zone_number: req.body.new_zone_info.zone_number,
    });
    if (!check_zone) {
      const new_storage = new Storage({
        zone_number: req.body.new_zone_info.zone_number,
      });
      await new_storage.save();
    }

    const check_sector = await Storage.findOne({
      zone_number: req.body.new_zone_info.zone_number,
      sector: {
        $elemMatch: {
          sector_number: req.body.new_zone_info.sector_number,
        },
      },
    });
    if (check_sector) {
      const new_sector = await Storage.findOne({
        zone_number: req.body.new_zone_info.zone_number,
      });
      new_sector.sector[req.body.new_zone_info.sector_number - 1].grade =
        req.body.new_zone_info.grade;

      await new_sector.save();
    }
    const storage_info = await Storage.find({});
    res.json({ message: "success!", storage_info: storage_info });
  } catch (err) {
    res.send(err);
  }
});

router.post("/api/delete", async (req, res) => {
  try {
    const check_zone = await Storage.findOne({
      zone_number: req.body.new_zone_info.zone_number,
    });
    if (!check_zone) {
      res.json({ message: "zone이 없음" });
    } else {
      const check_sector = await Storage.findOne({
        zone_number: req.body.new_zone_info.zone_number,
        sector: {
          $elemMatch: {
            sector_number: req.body.new_zone_info.sector_number,
          },
        },
      });

      if (
        !check_sector ||
        check_sector.sector.length != req.body.new_zone_info.sector_number
      ) {
        res.json({ message: "sector가 없음" });
      } else {
        const delete_sector = await Storage.findOne({
          zone_number: req.body.new_zone_info.zone_number,
        });

        await delete_sector.sector.pull({
          sector_number: req.body.new_zone_info.sector_number,
        });
        await delete_sector.save();

        const storage_info = await Storage.find({});
        res.json({ message: "success!", storage_info: storage_info });
      }
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/api/import", async (req, res) => {
  try {
    const check_zone = await Storage.findOne({
      zone_number: req.body.zone_info.zone_number,
    });
    if (!check_zone) {
      res.json({ message: "zone이 없음" });
    } else {
      const check_sector = await Storage.findOne({
        zone_number: req.body.zone_info.zone_number,
        sector: {
          $elemMatch: {
            sector_number: req.body.zone_info.sector.sector_number,
          },
        },
      });
      if (!check_sector) {
        res.json({ message: "sector가 없음" });
      } else {
        const new_pallet = await Storage.findOne({
          zone_number: req.body.zone_info.zone_number,
          sector: {
            $elemMatch: {
              sector_number: req.body.zone_info.sector.sector_number,
            },
          },
        });
        await new_pallet.sector[
          req.body.zone_info.sector.sector_number - 1
        ].pallet.push({
          item: req.body.zone_info.sector.pallet.item,
          quantity: req.body.zone_info.sector.pallet.quantity,
        });

        new_pallet.import_date_time = moment().add("9", "h");

        var item = {
          zone_number: req.body.zone_info.zone_number.toString(),
          sector_number: req.body.zone_info.sector.sector_number.toString(),
          item: req.body.zone_info.sector.pallet.item.toString(),
          quantity: req.body.zone_info.sector.pallet.quantity.toString(),
        };
        firebase
          .database()
          .ref("/import/" + item["zone_number"])
          .push(item);

        await new_pallet.save();

        const storage_info = await Storage.find({});
        res.json({ message: "success!", storage_info: storage_info });
      }
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/api/select/view", async (req, res) => {
  try {
    const check_zone = await Storage.findOne({
      zone_number: req.body.zone_number,
    });
    if (!check_zone) {
      res.json({ message: "zone이 없음" });
    } else {
      var items_grade = {
        A: 0,
        B: 0,
        C: 0,
        가공: 0,
      };

      check_zone.sector.forEach((sectors) => {
        sectors.pallet.forEach((pallets) => {
          items_grade[sectors.grade] += pallets.quantity;
        });
      });

      res.json({
        message: "success!",
        zone_info: items_grade,
      });
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/api/select/export", async (req, res) => {
  try {
    const check_zone = await Storage.findOne({
      zone_number: req.body.zone_number,
    });
    if (!check_zone) {
      res.json({ message: "zone이 없음" });
    } else {
      const check_sector = await Storage.findOne({
        zone_number: req.body.zone_number,
        sector: {
          $elemMatch: {
            sector_number: req.body.sector_number,
          },
        },
      });
      if (!check_sector) {
        res.json({ message: "sector가 없음" });
      } else {
        const new_pallet = await Storage.findOne({
          zone_number: req.body.zone_number,
          sector: {
            $elemMatch: {
              sector_number: req.body.sector_number,
            },
          },
        });

        res.json({
          message: "success!",
          sector_info: new_pallet.sector[req.body.sector_number - 1],
        });
      }
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/api/export", async (req, res) => {
  try {
    const new_pallet = await Storage.findOne({
      zone_number: req.body.zone_number,
      sector: {
        $elemMatch: {
          sector_number: req.body.sector_number,
        },
      },
    });

    var item = {
      zone_number: req.body.zone_number.toString(),
      sector_number: req.body.sector_number.toString(),
      item: req.body.item.toString(),
    };

    await new_pallet.sector[req.body.sector_number - 1].pallet.forEach(
      (element, index) => {
        if (req.body.time == element["updatedAt"].toISOString()) {
          var temp = element["quantity"];
          element["quantity"] -= req.body.quantity;
          item.quantity = (0 - req.body.quantity).toString();
          if (element["quantity"] <= 0) {
            item.quantity = (0 - temp).toString();

            new_pallet.sector[req.body.sector_number - 1].pallet.splice(
              index,
              1
            );
          }
        }
      }
    );

    firebase
      .database()
      .ref("/import/" + item["zone_number"])
      .push(item);

    new_pallet.export_date_time = moment().add("9", "h");
    await new_pallet.save();

    res.json({
      message: "success!",
      sector_info: new_pallet.sector[req.body.sector_number - 1],
    });
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
