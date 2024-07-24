const request = require("supertest");
const app = require("../src/app");

test('should register a new user', async () => {
  await request(app).post('/user/store').send({
    name: "Test",
    email: "rashidyusuf5253@gmail.com",
    password: "Yusuf123!"
  }).expect(200)
})
