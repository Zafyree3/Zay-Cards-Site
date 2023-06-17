Axios = require("axios");

Axios.get(
	"https://arjunverano95.github.io/goddess-story-library/data/goddess-story.json"
).then((response) => {
	// console.log(response.data.series);
	console.log("export const series = [");
	response.data.series.forEach((series) => {
		console.log(`\t"${series}",`);
	});
	console.log("];");
});
