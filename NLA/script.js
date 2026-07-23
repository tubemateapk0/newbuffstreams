const apiURL = "https://streamed.pk/api/matches/all";
const matchesBody = document.getElementById("matches-body");
const matchesTable = document.getElementById("matches-table");
const loadingDiv = document.getElementById("loading");

// Keyword filter
const keyword = "NLA"; // Change as needed
const cutoff = 6 * 60 * 60 * 1000; // 6 hours in ms
const targetSlug = getCategorySlug(keyword);

// Show loader initially
loadingDiv.style.display = "block";
matchesTable.style.display = "none";

function formatTime(unix) {
  const date = new Date(unix);
  return date.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
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

    matches.forEach(match => {
      const titleMatch = match.title && match.title.toLowerCase().includes(keyword.toLowerCase());
      const slugMatch = targetSlug && match.category === targetSlug;

      if (titleMatch || slugMatch) {
        allMatches.push({
          time: formatTime(match.date),
          sport: getCategoryName(match.category) || "-",
          tournament: "",
          match: match.title || "-",
          url: `https://tubemateapk0.github.io/streampage/?id=${match.id}`,
          isTitleMatch: !!titleMatch
        });
      }
    });

    allMatches.sort((a, b) => {
      if (a.isTitleMatch !== b.isTitleMatch) return a.isTitleMatch ? -1 : 1;
      return 0;
    });

    allMatches.forEach(m => {
      const linkHref = m.url;
      const tr = document.createElement("tr");
      tr.innerHTML = `
            <td>${m.time}</td>
            <td>${m.sport}</td>
            <td>${m.tournament}</td>
            <td>${m.match}</td>
            <td class="watch-cell">
              <span class="countdown">Watch in 10s</span>
              <a class="watch-btn hidden" target="_blank" href="${linkHref}">Watch</a>
            </td>
          `;

      matchesBody.appendChild(tr);

      const countdownEl = tr.querySelector(".countdown");
      const linkEl = tr.querySelector("a.watch-btn");

      let seconds = 10;
      countdownEl.textContent = `Watch in ${seconds}s`;

      const interval = setInterval(() => {
        seconds--;
        if (seconds > 0) {
          countdownEl.textContent = `Watch in ${seconds}s`;
        } else {
          clearInterval(interval);
          countdownEl.remove();
          linkEl.classList.remove("hidden");
        }
      }, 1000);
    });

    // Hide loader and show table
    loadingDiv.style.display = "none";
    matchesTable.style.display = allMatches.length > 0 ? "table" : "none";

    if (allMatches.length === 0) {
      matchesBody.innerHTML = `<tr><td colspan="5">⚠ No matches available.</td></tr>`;
      matchesTable.style.display = "table";
    }
  })
  .catch(err => {
    loadingDiv.innerHTML = `<p style="color:red;">⚠ Error loading matches</p>`;
    console.error(err);
  });
