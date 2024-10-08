import { $Q } from '../utils/query-selector'
import api from '../services/api'
import { stringToHTML } from '../utils/to-html'
import { initProductQuantity } from './product-quantity'

/**
 * Captures the HTML section of the product in question and returns data
 *
 * @param {String} handle Data element of the product
 * to which the query will be made
 * @param {String} variantId Id of the selected variant
 * @returns Object - price, available, button
 */
async function sectionHandle (handle, variantId) {
  const htmlResponse = await api.shopifyVariantByUrl(`/products/${handle}`, variantId)
  const variantPrice = $Q('.price-product-js', stringToHTML(htmlResponse))
  const variantAvailable = $Q('[name="available"]', stringToHTML(htmlResponse))
  const button = $Q('.btn-cart-js', stringToHTML(htmlResponse))
  const priceQuantityInitial = $Q('.container-quantity', stringToHTML(htmlResponse))

  return {
    price: variantPrice.outerHTML,
    available: variantAvailable.value,
    button: button.textContent,
    priceInitQuantity: {
      price: priceQuantityInitial.dataset.price,
      compare: priceQuantityInitial.dataset.compare
    }
  }
}

/**
 * Inject new title variant node to the section
 *
 * @param {HTMLElement} parent - Parent node to closest
 * @return null - stop called
 */
function updateTitleVariant (parent) {
  const radioSelected = $Q('input[type="radio"]:checked.js-option', parent)

  if (!radioSelected) return

  const variantName = radioSelected.parentElement.title
  const sectionPrice = $Q('.variants--name', parent)

  if (!sectionPrice) return

  sectionPrice.innerHTML = variantName
}

/**
 * Inject new price node to the section
 *
 * @param {HTMLCollection} variantPrice - Object with the price value
 * @param {HTMLElement} parent - Parent node to closest
 * with className 'product-js'
 *
 */
function updatePrice (variantPrice, parent) {
  const sectionPrice = $Q('.price-product-js', parent)

  sectionPrice.innerHTML = variantPrice
}

/**
 * Show not available of the variant, depending of the stock
 *
 * @param {String} available - Dataset available
 * @param {HTMLElement} parent - Parent node to closest
 * with className 'product-js'
 * @param {String} newText - New text in button add to cart
 */
function updateButton (available, parent, newText) {
  const button = $Q('.btn-cart-js', parent)
  button.innerHTML = newText

  if (available === 'false') {
    button.disabled = true
  } else {
    button.disabled = false
  }
}

/**
 * Section rendering to dynamic price and available data
 *
 * @param {HTMLElement} param0 - Node with event change
 *
 * @author Andres Briñez
 * @author Cristian Velasco
 * @author Edinson Figueroa
 * @version 2.0
 */
export async function queryVariants ({ target }) {
  const addcartBtn = $Q('.btn-cart-js', target.closest('.product-js'))
  const {
    value,
    dataset
  } = $Q('[name="id"]', target.closest('.product-js'))

  addcartBtn.disabled = true
  addcartBtn.innerHTML = '<div id="loading"></div>'
  updateTitleVariant(target.closest('.product-js'))

  const {
    price,
    available,
    button,
    priceInitQuantity
  } = await sectionHandle(dataset.variant, value)

  updatePrice(price, target.closest('.product-js'))
  updateButton(available, target.closest('.product-js'), button)
  if (!$Q('.quantity-product-js')) return
  updateQuantity(priceInitQuantity, $Q('.container-quantity'))
}

const updateQuantity = ({ price, compare }, container) => {
  const containerQuantity = container
  containerQuantity.dataset.price = price
  containerQuantity.dataset.compare = compare
  $Q('#quantity', containerQuantity).value = 1
  // ! quantity in product main
  initProductQuantity()
}
