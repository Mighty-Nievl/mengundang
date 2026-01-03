const hash = "$argon2id$v=19$m=65536,t=2,p=1$R7uEqEAhaprFnBY577XplmU+Klh63jO3QosBq9G/j5o$lwHyGA9+wpAZ1r7pyU1kjTZ+Orxo8bFolYDyCumOWCM";
const password = "admin12345678";
const isValid = await Bun.password.verify(password, hash);
console.log('Is valid:', isValid);
