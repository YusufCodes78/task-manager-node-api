const port = process.env.PORT;
import app from "./app.js";

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
