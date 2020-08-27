'use strict';

const cartButton = document.querySelector("#cart-button");
const modalCart = document.querySelector(".modal-cart");
const closeCart = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const loginForm = document.querySelector('#loginForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitle = document.querySelector('.restaurant-title');
const rating = document.querySelector('.rating');
const minPrice = document.querySelector('.price');
const category = document.querySelector('.category');
const inputSearch = document.querySelector('.input-search');
const modalCartBody = document.querySelector('.modal-body');
const modalCartPrice = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');

let login = localStorage.getItem('login');

let cart = [];

const loadCart = () => {
  if (localStorage.getItem(login)) cart.push(...JSON.parse(localStorage.getItem(login)));
};

const saveCart = () => localStorage.setItem(login, JSON.stringify(cart));

const getData = async (url) => {
  let response = await fetch(url);

  if (!response.ok) {
    throw new Error(`error in url: ${url}, status ${response.status}!`)
  }

  return await response.json();
};

const valid = str => { //additional
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str);
};

const toggleModalCart = () => modalCart.classList.toggle("is-open");

const toggleModalAuth = () => {
  modalAuth.classList.toggle('is-open');
  loginInput.style.border = ''; //dz1
};

const returnMain = () => {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
};

const authorized = () => {
  //console.log('authorized');

  const logOut = () => {
    login = null;
    cart.length = 0;
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    localStorage.removeItem('login');
    checkAuth();
    returnMain();
  };

  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  userName.textContent = login;
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';
  buttonOut.addEventListener('click', logOut);
  loadCart()
}

const notAuthorized = () => {
  //console.log('not authorized');

  const logIn = e => {
    e.preventDefault()
    if (valid(loginInput.value)) {
      login = loginInput.value;
      localStorage.setItem('login', login);
      toggleModalAuth();
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      loginForm.removeEventListener('submit', logIn);
      loginForm.reset();
      checkAuth();
    } else {
      loginInput.style.border = 'solid 2px red'; //dz1
      loginInput.value = ''; //additional
    }
  };

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  loginForm.addEventListener('submit', logIn);
};

const checkAuth = () => login ? authorized() : notAuthorized();

const createCardRestaurant = ({
  image,
  kitchen,
  name,
  price,
  products,
  stars,
  time_of_delivery: timeOfDelivery
}) => {

  const card = document.createElement('a');
  card.className = 'card card-restaurant';
  card.products = products;
  card.info = [name, stars, price, kitchen]; //dz3

  card.insertAdjacentHTML('beforeend', `
    <img src="${image}" alt="image" class="card-image" />
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title">${name}</h3>
        <span class="card-tag tag">${timeOfDelivery} мин</span>
      </div>
      <div class="card-info">
        <div class="rating">
        ${stars}
        </div>
        <div class="price">От ${price} ₽</div>
        <div class="category">${kitchen}</div>
      </div>
    </div>
  `);

  cardsRestaurants.insertAdjacentElement('beforeend', card);

};

const createCardMenu = ({
  id,
  name,
  description,
  price,
  image
}) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.id = id;
  card.insertAdjacentHTML('beforeend', `
						<img src="${image}" alt="image" class="card-image" />
						<div class="card-text">
							<div class="card-heading">
								<h3 class="card-title card-title-reg">${name}</h3>
							</div>
							<div class="card-info">
								<div class="ingredients">${description}
								</div>
							</div>
							<div class="card-buttons">
								<button class="button button-primary button-add-cart">
									<span class="button-card-text">В корзину</span>
									<span class="button-cart-svg"></span>
								</button>
								<strong class="card-price-bold">${price} ₽</strong>
							</div>
						</div>
  `);

  cardsMenu.insertAdjacentElement('beforeend', card);
};

const openMenu = e => {
  const target = e.target;
  const restaurant = target.closest('.card-restaurant');

  if (restaurant) {
    if (login) {
      const [
        name,
        stars,
        price,
        kitchen
      ] = restaurant.info;

      cardsMenu.textContent = '';

      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');

      restaurantTitle.textContent = name;
      rating.textContent = stars;
      minPrice.textContent = `От ${price} ₽`;
      category.textContent = kitchen;


      getData(`./db/${restaurant.products}`).then(data => {
        data.forEach(createCardMenu);
      });
    } else toggleModalAuth(); //dz2
  }
};

const searchMenu = e => { //additional2
  if (e.keyCode === 13) {
    const target = e.target;
    const value = target.value.toLowerCase().trim();

    if (!value) {
      target.style.border = 'solid 2px red';
      setTimeout(() => target.style.border = '', 2000);
      return;
    }

    target.value = '';
    const allMenu = [];

    getData('./db/partners.json').then(data => {
      const products = data.map((item) => item.products);

      products.forEach(product => {
        getData(`./db/${product}`).then((data) => {
          allMenu.push(...data);

          const searchMenu = allMenu.filter(item => item.name.toLowerCase().includes(value));

          cardsMenu.textContent = '';

          containerPromo.classList.add('hide');
          restaurants.classList.add('hide');
          menu.classList.remove('hide');

          restaurantTitle.textContent = 'Результат поиска';
          rating.textContent = '';
          minPrice.textContent = '';
          category.textContent = '';

          return searchMenu;
        }).then(data => data.forEach(createCardMenu));
      });
    });
  }
};

const addToCart = e => {
  const target = e.target;
  const button = target.closest('.button-add-cart');

  if (login) {
    if (button) {
      const card = target.closest('.card');
      const title = card.querySelector('.card-title').textContent;
      const price = card.querySelector('.card-price-bold').textContent;
      const id = card.id;

      const food = cart.find(item => item.id == id);

      if (food) {
        food.count += 1;
      } else {
        cart.push({
          title,
          price,
          id,
          count: 1
        });
      }
      saveCart();
    }
  } else toggleModalAuth(); //my stuff
};

const renderCart = () => {
  modalCartBody.textContent = '';
  cart.forEach(({
    id,
    title,
    price,
    count
  }) => {
    const cartItem = `
    <div class="food-row">
					<span class="food-name">${title}</span>
					<strong class="food-price">${price}</strong>
					<div class="food-counter">
						<button class="counter-button counter-minus" data-id='${id}'>-</button>
						<span class="counter">${count}</span>
						<button class="counter-button counter-plus" data-id='${id}'>+</button>
					</div>
				</div>
    `;
    modalCartBody.insertAdjacentHTML('afterbegin', cartItem);
  });

  const totalPrice = cart.reduce((result, item) => result += (parseFloat(item.price) * item.count), 0);

  modalCartPrice.textContent = totalPrice + ' ₽';
};

const changeCount = e => {
  const target = e.target;

  if (target.classList.contains('counter-button')) {
    const food = cart.find(item => item.id === target.dataset.id);

    if (target.classList.contains('counter-minus')) {
      food.count--;
      if (food.count === 0) cart.splice(cart.indexOf(food), 1);
    } else food.count++;

    renderCart();
    saveCart();
  }
};

const clearCart = () => {
  cart.length = 0;
  renderCart();
};

const init = () => {
  getData('./db/partners.json').then(data => data.forEach(createCardRestaurant));

  cartButton.addEventListener("click", renderCart);
  cartButton.addEventListener("click", toggleModalCart);
  buttonClearCart.addEventListener('click', clearCart);
  modalCartBody.addEventListener('click', changeCount);
  cardsMenu.addEventListener('click', addToCart);
  closeCart.addEventListener("click", toggleModalCart);
  cardsRestaurants.addEventListener('click', openMenu);
  logo.addEventListener('click', returnMain);
  inputSearch.addEventListener('keydown', searchMenu);

  checkAuth();

  new Swiper('.swiper-container', {
    loop: true,
    autoplay: {
      delay: 2000
    }
  })
};

init();