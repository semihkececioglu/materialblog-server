const express = require("express");
const router = express.Router();
const { analytics, getPropertyId } = require("../services/gaClient");

// ── Özet
router.get("/overview", async (req, res) => {
  try {
    const propertyId = await getPropertyId();
    if (!propertyId) {
      return res.status(400).json({ message: "GA Property ID tanımlı değil" });
    }

    const [response] = await analytics.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        { startDate: req.query.startDate, endDate: req.query.endDate },
      ],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
    });

    res.json(response.rows || []);
  } catch (err) {
    console.error("GA /overview error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ── Ziyaretçi trendleri (time series)
router.get("/timeseries", async (req, res) => {
  try {
    const propertyId = await getPropertyId();
    if (!propertyId) {
      return res.status(400).json({ message: "GA Property ID tanımlı değil" });
    }

    const metricName = req.query.metric || "activeUsers";

    const [response] = await analytics.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        { startDate: req.query.startDate, endDate: req.query.endDate },
      ],
      dimensions: [{ name: "date" }],
      metrics: [{ name: metricName }],
    });

    const data =
      response.rows?.map((r) => ({
        date: r.dimensionValues[0].value,
        value: parseInt(r.metricValues[0].value, 10),
      })) || [];

    res.json(data);
  } catch (err) {
    console.error("GA /timeseries error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ── En çok görüntülenen sayfalar
router.get("/top-pages", async (req, res) => {
  try {
    const propertyId = await getPropertyId();
    if (!propertyId) {
      return res.status(400).json({ message: "GA Property ID tanımlı değil" });
    }

    const limit = parseInt(req.query.limit, 10) || 10;

    const [response] = await analytics.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        { startDate: req.query.startDate, endDate: req.query.endDate },
      ],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [{ name: "screenPageViews" }],
      limit,
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    });

    const data =
      response.rows?.map((r) => ({
        path: r.dimensionValues[0].value,
        title: r.dimensionValues[1].value,
        views: parseInt(r.metricValues[0].value, 10),
      })) || [];

    res.json(data);
  } catch (err) {
    console.error("GA /top-pages error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
