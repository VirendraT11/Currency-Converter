document.addEventListener('DOMContentLoaded', () => {
  const fromCurrency = document.getElementById('fromCurrency');
  const toCurrency = document.getElementById('toCurrency');
  const amount = document.getElementById('amount');
  const result = document.getElementById('result');
  const historicalData = document.getElementById('historicalData');
  const newsFeed = document.getElementById('newsFeed');
  const form = document.getElementById('converterForm');
  const themeToggle = document.getElementById('themeToggle');
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const loginButton = document.getElementById('loginButton');
  const registerButton = document.getElementById('registerButton');
  const logoutButton = document.getElementById('logoutButton');
  const closeModalButtons = document.querySelectorAll('.close');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const API_KEY = 'YOUR_CUURENCY_EXCHANGE_API_KEY';
  const NEWS_API_KEY = 'YOUR_NEWS_API_KEY'; // Replace with your news API key

  let userToken = '';

  // Populate currency select options
  fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/codes`)
    .then(response => response.json())
    .then(data => {
      data.supported_codes.forEach(currency => {
        const option1 = document.createElement('option');
        option1.value = currency[0];
        option1.textContent = currency[0];
        fromCurrency.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = currency[0];
        option2.textContent = currency[0];
        toCurrency.appendChild(option2);
      });
    })
    .catch(error => {
      console.error('Error fetching currency codes:', error);
    });

  // Convert currency
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const from = fromCurrency.value;
    const to = toCurrency.value;
    const amountValue = amount.value;

    if (!from || !to || !amountValue || isNaN(amountValue)) {
      result.textContent = 'Please enter valid input values';
      return;
    }

    fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${from}`)
      .then(response => response.json())
      .then(data => {
        if (!data.conversion_rates[to]) {
          result.textContent = 'Conversion rate not available for the selected currency';
          return;
        }
        const rate = data.conversion_rates[to];
        const convertedAmount = (amountValue * rate).toFixed(2);
        result.textContent = `${amountValue} ${from} = ${convertedAmount} ${to}`;

        // Fetch historical data
        const date = new Date();
        date.setDate(date.getDate() - 1);
        const formattedDate = date.toISOString().split('T')[0];
        fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/history/${from}/${formattedDate}`)
          .then(response => response.json())
          .then(data => {
            const historicalRate = data.conversion_rates[to];
            historicalData.textContent = `Historical rate on ${formattedDate}: 1 ${from} = ${historicalRate} ${to}`;
          });

        // Fetch news
        fetch(`https://newsapi.org/v2/everything?q=${to} currency&apiKey=${NEWS_API_KEY}`)
          .then(response => response.json())
          .then(data => {
            newsFeed.innerHTML = '<h3>Latest News:</h3>';
            data.articles.forEach(article => {
              const articleElement = document.createElement('div');
              articleElement.innerHTML = `<a href="${article.url}" target="_blank">${article.title}</a>`;
              newsFeed.appendChild(articleElement);
            });
          })
          .catch(error => {
            console.error('Error fetching news:', error);
          });
      })
      .catch(error => {
        result.textContent = 'Error fetching conversion rate';
        console.error('Error fetching conversion rate:', error);
      });
  });

  // Toggle dark mode
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  // Open/close modals
  loginButton.addEventListener('click', () => {
    loginModal.style.display = 'block';
  });

  registerButton.addEventListener('click', () => {
    registerModal.style.display = 'block';
  });

  closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      loginModal.style.display = 'none';
      registerModal.style.display = 'none';
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target == loginModal) {
      loginModal.style.display = 'none';
    }
    if (e.target == registerModal) {
      registerModal.style.display = 'none';
    }
  });

  // Handle login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          userToken = data.token;
          loginModal.style.display = 'none';
          loginButton.style.display = 'none';
          registerButton.style.display = 'none';
          logoutButton.style.display = 'block';
        } else {
          alert('Login failed');
        }
      })
      .catch(error => {
        console.error('Error logging in:', error);
      });
  });

  // Handle registration
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          registerModal.style.display = 'none';
        } else {
          alert('Registration failed');
        }
      })
      .catch(error => {
        console.error('Error registering:', error);
      });
  });

  // Handle logout
  logoutButton.addEventListener('click', () => {
    userToken = '';
    loginButton.style.display = 'block';
    registerButton.style.display = 'block';
    logoutButton.style.display = 'none';
  });
});
