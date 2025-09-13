let ultimaBusca = null;

// Função para sugerir cidades enquanto o usuário digita
async function sugerirCidades() {
  const termo = document.getElementById("cidade").value.trim();
  const sugestoesDiv = document.getElementById("sugestoes");
  sugestoesDiv.innerHTML = "";

  if (termo.length < 2) return;

  if (ultimaBusca) clearTimeout(ultimaBusca);

  ultimaBusca = setTimeout(async () => {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${termo}&count=5&language=pt&format=json`;
      const resp = await fetch(url);
      const dados = await resp.json();

      if (!dados.results) return;

      dados.results.forEach(cidade => {
        const item = document.createElement("div");
        item.classList.add("sugestao");
        item.textContent = `${cidade.name}, ${cidade.admin1 || ""} - ${cidade.country}`;
        item.onclick = () => {
          document.getElementById("cidade").value = cidade.name;
          sugestoesDiv.innerHTML = "";
          buscarClima(cidade);
        };
        sugestoesDiv.appendChild(item);
      });
    } catch (erro) {
      console.error("Erro ao buscar sugestões:", erro);
    }
  }, 400);
}

async function buscarClima(cidadeSelecionada = null) {
  const termo = cidadeSelecionada ? cidadeSelecionada.name : (document.getElementById("cidade").value || "Fortaleza");

  try {
    let latitude, longitude, timezone, name, country;

    if (cidadeSelecionada) {
      latitude = cidadeSelecionada.latitude;
      longitude = cidadeSelecionada.longitude;
      timezone = cidadeSelecionada.timezone;
      name = cidadeSelecionada.name;
      country = cidadeSelecionada.country;
    } else {
      const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${termo}&count=1&language=pt&format=json`;
      const geoResp = await fetch(geoURL);
      const geoData = await geoResp.json();

      if (!geoData.results || geoData.results.length === 0) {
        alert("Cidade não encontrada!");
        return;
      }

      ({ latitude, longitude, timezone, name, country } = geoData.results[0]);
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset&timezone=${timezone}`;
    const resposta = await fetch(url);
    const dados = await resposta.json();

    document.getElementById("titulo").textContent = `🌤️ Clima em ${name}, ${country}`;

    const clima = dados.current_weather;
    document.getElementById("temperatura").textContent = clima.temperature + " °C";
    document.getElementById("vento").textContent = "Vento: " + clima.windspeed + " km/h";
    document.getElementById("hora").textContent = "Atualizado: " + new Date(clima.time).toLocaleString("pt-BR");

    document.getElementById("minmax").textContent =
      dados.daily.temperature_2m_min[0] + "° / " + dados.daily.temperature_2m_max[0] + "°";

    document.getElementById("chuva").textContent = "Chuva: " + dados.daily.precipitation_sum[0] + " mm";
    document.getElementById("umidade").textContent = "Umidade: -- %";

    document.getElementById("nascer").textContent =
      "Nascer: " + new Date(dados.daily.sunrise[0]).toLocaleTimeString("pt-BR", {hour: '2-digit', minute: '2-digit'});
    document.getElementById("por").textContent =
      "Pôr: " + new Date(dados.daily.sunset[0]).toLocaleTimeString("pt-BR", {hour: '2-digit', minute: '2-digit'});

    const previsaoDiv = document.getElementById("previsao");
    previsaoDiv.innerHTML = "";
    for (let i = 1; i < 5; i++) {
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

// Detectar localização do usuário
function buscarLocalizacao() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      try {
        const geoURL = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=pt&format=json`;
        const resp = await fetch(geoURL);
        const dados = await resp.json();

        if (dados && dados.results && dados.results.length > 0) {
          buscarClima(dados.results[0]);
        } else {
          alert("Não foi possível identificar sua cidade.");
        }
      } catch (erro) {
        console.error("Erro ao buscar localização:", erro);
      }
    }, () => {
      alert("Não foi possível acessar sua localização.");
    });
  } else {
    alert("Geolocalização não suportada no navegador.");
  }
}

// Carrega clima padrão (Fortaleza)
buscarClima();