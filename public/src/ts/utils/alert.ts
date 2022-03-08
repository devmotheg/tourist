/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

class Alert {
	constructor(type: "success" | "error", msg: string) {
		this.display(type, msg);
	}

	static IncorrectFillingError() {
		new Alert("error", "Fill in the fields correctly");
	}

	private clear() {
		document.querySelector(".alert")?.parentElement?.remove();
	}

	private display(type: "success" | "error", msg: string) {
		this.clear();

		const border = type === "success" ? "border-primary" : "border-orange-500",
			text = type === "success" ? "text-primary" : "text-orange-500";

		document.body.insertAdjacentHTML(
			"afterbegin",
			`
      <div class="absolute z-20">
        <div class="alert transition left-1/2 opacity-0 fixed flex items-center max-w-lg py-4 pl-2 pr-8 text-xl -translate-x-1/2 bg-white border-l-[0.35rem] border-solid rounded-md shadow-lg ${border}">
          <span class="text font-bold [writing-mode:_vertical-rl] capitalize mr-4 -scale-100 ${text}">
            ${type}
          </span>
          <p class="font-bold break-all">
            ${msg}
          </p>
        </div>
      </div>
      `
		);

		const $dom = document.querySelector(".alert");

		setTimeout(() => {
			$dom?.classList.remove("opacity-0");
			$dom?.classList.add("translate-y-2", "opacity-1");

			setTimeout(() => {
				$dom?.classList.remove("translate-y-2", "opacity-1");
				$dom?.classList.add("opacity-0");
			}, 2000);
		}, 300);
	}
}

export default Alert;
