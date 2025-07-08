export function log(message) {
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
  console.log(`[\x1b[36m${timestamp}\x1b[0m] ${message}`);
}
