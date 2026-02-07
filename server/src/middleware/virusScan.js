// virusScan.js
// Mock virus scan middleware
const virusScan = async function virusScanMiddleware(req, res, next) {
  // TODO: Integrate with ClamAV or other AV engine
  // For now, always pass
  next();
};
export default virusScan; 