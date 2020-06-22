
module.exports = {
  "reporters": [
    "default",
    [
      "./node_modules/jest-html-reporter",
      {
        "pageTitle": "Vendor Interoperability Report",
        "outputPath": "../../vendor-interoperability.html"
      }
    ]
  ]
};