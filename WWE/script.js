const apiURL = "https://streamed.pk/api/matches/all";
const matchesBody = document.getElementById("matches-body");
const matchesTable = document.getElementById("matches-table");
const loadingDiv = document.getElementById("loading");

// Keyword filter
const keyword = "WWE"; // Change as needed
const cutoff = 6 * 60 * 60 * 1000; // 6 hours in ms
const targetSlug = getCategorySlug(keyword);

// Show loader initially
loadingDiv.style.display = "block";
matchesTable.style.display = "none";

function formatTime(unix) {
  const date = new Date(unix);
  return date.toLocaleString(undefined, {
    weekday: "short",
   
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

function getCategorySlug(keyword) {
  const map = {
    "NFL":"american-football","CFL":"american-football","College":"american-football",
    "Basketball":"basketball","NBA":"basketball","NCAA":"basketball",
    "Football":"football","Bundesliga":"football","La Liga":"football",
    "Premier":"football","Championship":"football","FNL":"football",
    "HNL":"football","World":"football","Friendly":"football","Super":"football",
    "Baseball":"baseball","MLB":"baseball",
    "Hockey":"hockey","Ice":"hockey","NHL":"hockey","NLA":"hockey","NLB":"hockey","SHL":"hockey",
    "Formula":"motor-sports","MotoGP":"motor-sports","Motorsport":"motor-sports",
    "Boxing":"fight","MMA":"fight","UFC":"fight","WWE":"fight","PFL":"fight",
    "Tennis":"tennis","Rugby":"rugby","NRLW":"rugby",
    "Golf":"golf","AFL":"afl","Aussie":"afl",
    "Cricket":"cricket","Snooker":"billiards","Darts":"darts"
  };
  return map[keyword] || null;
}

function getCategoryName(category) {
  const names = {
    "american-football": "American Football",
    "basketball": "Basketball",
    "football": "Football",
    "baseball": "Baseball",
    "hockey": "Hockey",
    "motor-sports": "Motor Sports",
    "fight": "Fight",
    "tennis": "Tennis",
    "rugby": "Rugby",
    "golf": "Golf",
    "afl": "AFL",
    "cricket": "Cricket",
    "billiards": "Billiards",
    "darts": "Darts",
    "other": "Other"
  };
  return names[category] || category;
}
fetch(apiURL)
  .then(res => res.json())
  .then(matches => {
    let allMatches = [];
    let liveCount = 0;

    matches.forEach(match => {
      const matchTime = match.date;
      const diffMinutes = (Date.now() - matchTime) / 60000;

      const titleMatch = match.title && match.title.toLowerCase().includes(keyword.toLowerCase());
      const slugMatch = targetSlug && match.category === targetSlug;

      if (!titleMatch && !slugMatch) return;

      if (diffMinutes >= 180) return;

      let status = "";
      if (diffMinutes >= 150) status = "finished";
      else if (diffMinutes >= 0 && diffMinutes < 150) {
        status = "live";
        liveCount++;
      } else {
        status = "upcoming";
      }

      allMatches.push({
        time: formatTime(matchTime),
        sport: getCategoryName(match.category) || "-",
        tournament: "",
        match: match.title || "-",
        status,
        url: `https://tubemateapk0.github.io/streampage/?id=${match.id}`,
        isTitleMatch: !!titleMatch
      });
    });

    // Title matches first, then category matches
    allMatches.sort((a, b) => {
      if (a.isTitleMatch !== b.isTitleMatch) return a.isTitleMatch ? -1 : 1;
      return 0;
    });

    // Update live count in button
    document.getElementById("live-count").textContent = liveCount;

    // ✅ Same render + filter functions as before...
    function renderMatches(filter) {
      matchesBody.innerHTML = "";
      let filtered = allMatches.filter(m => filter === "all" || m.status === filter);

      if (filtered.length === 0) {
        matchesBody.innerHTML = `<tr><td colspan="5">⚠ No matches available.</td></tr>`;
      } else {
        filtered.forEach(m => {
          const badge =
            m.status === "finished"
              ? `<span class="badge finished"></span>`
              : m.status === "live"
              ? `<span class="badge live"></span>`
              : "";

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${m.time}</td>
            <td>${m.sport}</td>
            <td>${m.tournament}</td>
            <td>${m.match} ${badge}</td>
            <td><a class="watch-btn" target="_blank" href="${m.url}">Watch</a></td>
          `;
          matchesBody.appendChild(row);
        });
      }
      matchesTable.style.display = "table";
    }

    // Initial render (All)
    renderMatches("all");

    // Button events
    document.getElementById("all-btn").addEventListener("click", () => {
      setActive("all-btn");
      renderMatches("all");
    });

    document.getElementById("live-btn").addEventListener("click", () => {
      setActive("live-btn");
      renderMatches("live");
    });

    document.getElementById("upcoming-btn").addEventListener("click", () => {
      setActive("upcoming-btn");
      renderMatches("upcoming");
    });

    function setActive(id) {
      document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
      document.getElementById(id).classList.add("active");
    }

    // Hide loader
    loadingDiv.style.display = "none";
  })
  .catch(err => {
    loadingDiv.innerHTML = `<p style="color:red;">⚠ Error loading matches</p>`;
    console.error(err);
  });










