async function buscarClima() {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=-3.7172&longitude=-38.5433&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset&timezone=America%2FFortaleza";

  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    // Clima atual
    const clima = dados.current_weather;
    document.getElementById("temperatura").textContent = clima.temperature + " °C";
    document.getElementById("vento").textContent = "Vento: " + clima.windspeed + " km/h";
    document.getElementById("hora").textContent = "Atualizado: " + new Date(clima.time).toLocaleString("pt-BR");

    // Mínima e Máxima de hoje
    document.getElementById("minmax").textContent =
      dados.daily.temperature_2m_min[0] + "° / " + dados.daily.temperature_2m_max[0] + "°";

    // Chuva e Umidade (API não traz umidade atual, mas traz precipitação prevista)
    document.getElementById("chuva").textContent = "Chuva: " + dados.daily.precipitation_sum[0] + " mm";
    document.getElementById("umidade").textContent = "Umidade: -- %"; // precisa de outra API para ser real

    // Nascer e Pôr do sol
    document.getElementById("nascer").textContent = "Nascer: " + new Date(dados.daily.sunrise[0]).toLocaleTimeString("pt-BR", {hour: '2-digit', minute: '2-digit'});
    document.getElementById("por").textContent = "Pôr: " + new Date(dados.daily.sunset[0]).toLocaleTimeString("pt-BR", {hour: '2-digit', minute: '2-digit'});

    // Previsão próximos dias
    const previsaoDiv = document.getElementById("previsao");
    previsaoDiv.innerHTML = "";
    for (let i = 1; i < 5; i++) { // mostra os próximos 4 dias
      const dia = new Date(dados.daily.time[i]).toLocaleDateString("pt-BR", {weekday: "short"});
      const min = dados.daily.temperature_2m_min[i];
      const max = dados.daily.temperature_2m_max[i];
      const chuva = dados.daily.precipitation_sum[i];

      const div = document.createElement("div");
      div.classList.add("dia");
      div.innerHTML = `<strong>${dia}</strong><br>🌡 ${min}° / ${max}°<br>🌧 ${chuva} mm`;
      previsaoDiv.appendChild(div);
    }
  } catch (erro) {
    alert("Erro ao buscar clima 😢");
    console.error(erro);
  }
}

// Carrega clima ao abrir a página
buscarClima();
