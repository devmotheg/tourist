/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

class InputsValidator {
	values: { [index: string]: string | boolean };

	constructor(validators: Validators) {
		this.values = {};

		for (const selector of Object.keys(validators)) {
			const $dom = <HTMLInputElement>document.querySelector(selector);
			this.validate($dom, validators[selector]);
		}
	}

	private validate(
		$dom: HTMLInputElement,
		validator: (value: string) => boolean
	) {
		$dom.addEventListener("input", () => {
			if (validator($dom.value)) {
				$dom.classList.remove("focus:border-orange-400");
				$dom.classList.add("focus:border-primary");
				this.values[$dom.name] = $dom.value;
			} else {
				$dom.classList.remove("focus:border-primary");
				$dom.classList.add("focus:border-orange-400");
				this.values[$dom.name] = false;
			}
		});
	}

	isValid() {
		return Object.values(this.values).reduce((acc, val) => acc && val, true);
	}
}

export default InputsValidator;
