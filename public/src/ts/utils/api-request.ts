/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import axios from "axios";
import Alert from "./alert";

class APIRequest {
	[index: string]: any;

	$dom: HTMLButtonElement;
	data?: { [index: string]: any };
	cb?: () => void;

	constructor(
		$dom: HTMLButtonElement,
		data?: { [index: string]: any },
		cb?: () => void
	) {
		this.$dom = $dom;
		this.data = data;
		this.cb = cb;
	}

	private down() {
		this.$dom.disabled = true;
	}

	private up() {
		this.$dom.disabled = false;
	}

	private async send(url: string, method: "GET" | "POST" | "PATCH" | "DELETE") {
		try {
			this.down();

			const res = await axios({
				url,
				method,
				baseURL: "/api/v1/",
				data: this.data,
			});

			if (res.data.message) new Alert("success", res.data.message);
			if (this.cb) setTimeout(this.cb, 2000);

			return res;
		} catch (err: any) {
			if (err.response && err.response.data.message)
				new Alert("error", err.response.data.message);
		} finally {
			this.up();
		}
	}

	signIn() {
		this.send("users/sign-in", "POST");
	}

	signUp() {
		this.send("users/sign-up", "POST");
	}

	signOut() {
		this.send("users/sign-out", "GET");
	}

	forgotPassword() {
		this.send("users/forgot-password", "POST");
	}

	resetPassword() {
		this.send(`users/reset-password/${this.data?.token}`, "PATCH");
		delete this.data?.token;
	}

	updateMyInfo() {
		this.send("users/me/update-information", "PATCH");
	}

	updateMyPassword() {
		this.send("users/me/update-password", "PATCH");
	}

	createMyReview() {
		this.send("reviews/me", "POST");
	}

	updateMyReview() {
		this.send("reviews/me", "PATCH");
	}

	deleteMyReview() {
		this.send("reviews/me", "DELETE");
	}

	createMyBooking() {
		this.send("bookings/me", "POST");
	}

	updateMyBooking() {
		this.send("bookings/me", "PATCH");
	}

	deleteMyBooking() {
		this.send("bookings/me", "DELETE");
	}
}

export default APIRequest;
