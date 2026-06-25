const instapay     = require("./instapay.provider");
const vodafoneCash = require("./vodafoneCash.provider");
const orangeCash   = require("./orangeCash.provider");

const providers = {
  instapay,
  vodafone_cash: vodafoneCash,
  orange_cash:   orangeCash,
};

// Returns the correct provider adapter by name.
// To add a new provider: create the file, register it here — nothing else changes.
function getProvider(providerName) {
  const provider = providers[providerName];
  if (!provider) {
    throw new Error(`Unknown payment provider: "${providerName}". Supported: ${Object.keys(providers).join(", ")}`);
  }
  return provider;
}

module.exports = { getProvider };
