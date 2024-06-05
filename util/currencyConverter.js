export const currencyConverter = async ( total_cost ) => {
    const api = "https://api.exchangerate-api.com/v4/latest/USD";

    let finalValue = "";

    async function getResults() {
        try {
            const response = await fetch(api);
            const currency = await response.json();
            displayResults(currency);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function displayResults(currency) {
        let fromRate = currency.rates["INR"];
        let toRate = currency.rates["USD"];
        finalValue = ((toRate / fromRate) * total_cost ).toFixed(2);
    }

    await getResults();
    return { finalValue };
}
