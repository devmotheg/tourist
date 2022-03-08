/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

declare const mapboxgl: any;

const initMapbox = (page?: string, user?: string) => {
	const startLocation = JSON.parse(
		(<HTMLDivElement>document.querySelector("#map")).dataset?.startLocation!
	);

	// Use the public key so we can initiate the rest of our map components using the `mapboxgl` object
	mapboxgl.accessToken =
		"pk.eyJ1IjoiZGV2bW90aGVnIiwiYSI6ImNrejRxbnFiMTBobjUycHJ4ZHd2ZzZpcmsifQ.J3zkNOz3wr01GhhdYPLFZA";

	const map = new mapboxgl.Map({
		container: "map",
		style: "mapbox://styles/devmotheg/ckz4sfhd5001p14p9jw98jpj1",
	});

	new mapboxgl.Marker({
		anchor: "bottom",
	})
		.setLngLat(startLocation.coordinates)
		.addTo(map);

	new mapboxgl.Popup({
		offset: 50,
		anchor: "bottom",
		closeButton: false,
		closeOnClick: false,
		closeOnMove: false,
	})
		.setLngLat(startLocation.coordinates)
		.setHTML(`<p>Tour Location</p>`)
		.addTo(map);

	// Mapbox also flips the <lat>,<lng> coordinates to <lng>,<lat>
	const bounds = new mapboxgl.LngLatBounds();
	bounds.extend(startLocation.coordinates);
	map.fitBounds(bounds);
};

export default initMapbox;
