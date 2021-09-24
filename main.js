import $ from 'jquery'
import Scrollbar from 'smooth-scrollbar'

import 'slick-carousel'

import './src/css/style.css'

import './node_modules/slick-carousel/slick/slick.css'
import './node_modules/slick-carousel/slick/slick-theme.css'

import { getPublicMembers } from './src/js/githubApiWrapper'
import appendMember from './src/js/appendMember'

$(function () {
  $('.nav-toggler').each(function (_, navToggler) {
    const target = $(navToggler).data('target')
    $(navToggler).on('click', function () {
      $(target).animate({
        height: 'toggle',
      })
    })
  })

  $('.card-slider').slick({
    slidesToShow: 3,
    autoplay: true,
    slidesToScroll: 1,
    dots: false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  })
})

let cards = document.querySelectorAll('.card')
let cardTitle = document.querySelectorAll('.card__title')
let cardCategory = document.querySelectorAll('.card__category')
let card
let modal = document.querySelector('.modal')
let modalTitle = document.querySelector('.modal__title')
let modalCategory = document.querySelector('.modal__category')
let closeButton = document.querySelector('.modal__close-button')
const cardBgImage = document.querySelector('.card__background-image')
let page = document.querySelector('.page')

const cardBorderRadius = 20
const openingDuration = 600 //ms
const closingDuration = 600 //ms
const timingFunction = 'cubic-bezier(.76,.01,.65,1.38)'

Scrollbar.init(document.querySelector('.modal__scroll-area'))

function flipAnimation(first, last, options) {
  let firstRect = first.getBoundingClientRect()
  let lastRect = last.getBoundingClientRect()

  let deltas = {
    top: firstRect.top - lastRect.top,
    left: firstRect.left - lastRect.left,
    width: firstRect.width / lastRect.width,
    height: firstRect.height / lastRect.height,
  }

  return last.animate(
    [
      {
        transformOrigin: 'top left',
        borderRadius: `
                    ${cardBorderRadius / deltas.width}px / ${
          cardBorderRadius / deltas.height
        }px`,
        transform: `
                        translate(${deltas.left}px, ${deltas.top}px)
                        scale(${deltas.width}, ${deltas.height})`,
      },
      {
        transformOrigin: 'top left',
        transform: 'none',
        borderRadius: `${cardBorderRadius}px`,
      },
    ],
    options
  )
}

cards.forEach((item) => {
  item.addEventListener('click', (e) => {
    $('.card-slider').slick('slickPause')
    card = e.currentTarget
    page.dataset.modalState = 'opening'
    card.classList.add('card--opened')
    card.style.opacity = 0
    document.querySelector('body').classList.add('no-scroll')

    const img = item.querySelector('img')
    const category = item.querySelector('.card__category')
    const title = item.querySelector('.card__title')

    // change modal bgImage based on card that is clicked
    cardBgImage.src = img.src

    modalCategory.innerHTML = category.innerHTML

    modalTitle.innerHTML = title.innerHTML

    let animation = flipAnimation(card, modal, {
      duration: openingDuration,
      easing: timingFunction,
      fill: 'both',
    })

    animation.onfinish = () => {
      page.dataset.modalState = 'open'
      animation.cancel()
    }
  })
})

closeButton.addEventListener('click', (e) => {
  page.dataset.modalState = 'closing'
  document.querySelector('body').classList.remove('no-scroll')

  let animation = flipAnimation(card, modal, {
    duration: closingDuration,
    easing: timingFunction,
    direction: 'reverse',
    fill: 'both',
  })

  animation.onfinish = () => {
    page.dataset.modalState = 'closed'
    card.style.opacity = 1
    card.classList.remove('card--opened')
    $('.card-slider').slick('slickPlay')
    animation.cancel()
  }
})

getPublicMembers().then((members) => {
  const membersContainer = document.querySelector('#team #members')

  // Initialize lazy loader
  let observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.src = entry.target.dataset.src
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.65 }
  )

  const appender = appendMember(membersContainer, observer)
  members.forEach(appender)
})
