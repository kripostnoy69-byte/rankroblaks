import express from "express";
const GROUP_ID = "657998926";
const TARGET_ROLE = "groups/657998926/roles/856752100";
const API_KEY = process.env.ROBLOX_API_KEY;
const NEWCOMER_MINUTES = 60;

let busy = false;
async function checkOnce() {
  if (busy) return;
  busy = true;
  try {
    console.log("проверка новичков...");
    let pageToken = "";
    do {
      const url = `https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships?maxPageSize=100` + (pageToken ? `&pageToken=${pageToken}` : "");
      const res = await fetch(url, { headers: { "x-api-key": API_KEY } });
      const data = await res.json();
      if (!data.groupMemberships) { console.log(data); break; }
      for (const m of data.groupMemberships) {
        if (m.role === TARGET_ROLE) continue;
        const ageMs = Date.now() - new Date(m.createTime).getTime();
        if (ageMs > NEWCOMER_MINUTES * 60 * 1000) continue;
        const userId = m.path.split("/").pop();
        console.log(`новичок ${userId}, выдаю роль...`);
        await fetch(`https://apis.roblox.com/cloud/v2/groups/${GROUP_ID}/memberships/${userId}:assignRole`, {
          method: "POST",
          headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ role: TARGET_ROLE })
        });
      }
      pageToken = data.nextPageToken || "";
    } while (pageToken);
  } catch (e) {
    console.log("ошибка:", e.message);
  }
  busy = false;
}

const app = express();
app.get("/", (req, res) => res.send("ok bot works"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("started on " + PORT));
checkOnce();
setInterval(checkOnce, 45 * 1000);
