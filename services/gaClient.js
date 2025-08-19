const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const Setting = require("../models/Setting");

const analytics = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA4_CLIENT_EMAIL,
    private_key: process.env.GA4_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

async function getPropertyId() {
  const settings = await Setting.getSingleton();
  return settings.gaPropertyId; // kullanıcı admin panelden kaydedecek
}

module.exports = { analytics, getPropertyId };
