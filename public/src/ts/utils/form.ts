/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

import InputsValidator from "./inputs-validator";
import APIRequest from "./api-request";
import Alert from "./alert";

const validators: Validators = {
	name: (value: string) =>
		/^[a-zA-Z]{2,} ?(?:[a-zA-Z]{2,})?$/.test(value) && value.length <= 18,
	email: (value: string) =>
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
			value
		) && value.length <= 254,
	password: (value: string) => value.length >= 8,
};

class Form {
	private validator: InputsValidator;
	$dom: HTMLButtonElement;

	constructor(
		ids: string[],
		$dom: HTMLButtonElement,
		method: string,
		extraData?: { [index: string]: any },
		formData = false,
		cb?: () => void
	) {
		this.validator = new InputsValidator(
			Object.keys(validators).reduce(
				(acc: { [index: string]: (value: string) => boolean }, val) => {
					for (const id of ids)
						if (new RegExp(val).test(id)) acc[id] = validators[val];
					return acc;
				},
				{}
			)
		);

		this.$dom = $dom;
		this.$dom.addEventListener("click", e => {
			e.preventDefault();

			if (this.validator.isValid()) {
				let data: any = { ...this.validator.values };
				if (extraData) {
					for (const name of Object.keys(extraData))
						data[name] = extraData[name]();
				}
				if (formData) {
					const form = new FormData();
					for (const name of Object.keys(data))
						form.append(name, <string | Blob>data[name]);
					data = form;
				}
				new APIRequest(this.$dom, data, cb)[method]();
			} else Alert.IncorrectFillingError();
		});
	}
}

export default Form;
