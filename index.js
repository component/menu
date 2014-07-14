
/**
 * Module dependencies.
 */

var classes = require('classes');
var domify = require('domify');
var Emitter = require('emitter');
var empty = require('empty');
var event = require('event');
var query = require('query');

/**
 * Expose `Menu`.
 */

module.exports = Menu;

/**
 * Initialize a new `Menu`.
 *
 * Emits:
 *
 *   - "show" when shown
 *   - "hide" when hidden
 *   - "remove" with the item name when an item is removed
 *   - "select" (item) when an item is selected
 *   - * menu item events are emitted when clicked
 *
 * @api public
 */

function Menu() {
  if (!(this instanceof Menu)) return new Menu();

  this.items = {};
  this.el = domify('<ul class="menu" style="display: none;"></ul>');

  event.bind(this.el, 'hover', this.deselect.bind(this));

  document.body.appendChild(this.el);

  this.onkeydown = this.onkeydown.bind(this);
  event.bind(document.documentElement, 'click', this.hide.bind(this));

  this.on('show', this.bindKeyboardEvents.bind(this));
  this.on('hide', this.unbindKeyboardEvents.bind(this));
}

/**
 * Mixin `Emitter`.
 */

Emitter(Menu.prototype);

/**
 * Deselect selected menu items.
 *
 * @api private
 */

Menu.prototype.deselect = function(){
  var selected = query.all('.selected', this.el);
  for (var i = 0; i < selected.length; i++) {
    classes(selected[i]).remove('selected');
  }
  return this;
};

/**
 * Bind keyboard events.
 *
 * @api private
 */

Menu.prototype.bindKeyboardEvents = function(){
  event.bind(document.documentElement, 'keydown', this.onkeydown);
  return this;
};

/**
 * Unbind keyboard events.
 *
 * @api private
 */

Menu.prototype.unbindKeyboardEvents = function(){
  event.unbind(document.documentElement, 'keydown', this.onkeydown);
  return this;
};

/**
 * Handle keydown events.
 *
 * @api private
 */

Menu.prototype.onkeydown = function(e){
  switch (e.keyCode) {
    // esc
    case 27:
      this.hide();
      break;
    // up
    case 38:
      e.preventDefault();
      e.stopImmediatePropagation();
      this.move('previous');
      break;
    // down
    case 40:
      e.preventDefault();
      e.stopImmediatePropagation();
      this.move('next');
      break;
  }
};

/**
 * Focus on the next menu item in `direction`.
 *
 * @param {String} direction "previous" or "next"
 * @api public
 */

Menu.prototype.move = function(direction){
  var prev = query.all('.selected', this.el);

  var next = prev.length > 0
    ? prev[0][direction + 'ElementSibling']
    : query('li:first-child', this.el);

  if (next) {
    for (var i = 0; i < prev.length; i++) {
      classes(prev[i]).remove('selected');
    }
    classes(next).add('selected');
    var a = query('a', next);
    if (a) a.focus();
  }
};

/**
 * Add menu item with the given `text` and optional callback `fn`.
 *
 * When the item is clicked `fn()` will be invoked
 * and the `Menu` is immediately closed. When clicked
 * an event of the name `text` is emitted regardless of
 * the callback function being present.
 *
 * @param {String} text
 * @param {Function} fn
 * @return {Menu}
 * @api public
 */

Menu.prototype.add = function(text, fn){
  var slug;

  // slug, text, [fn]
  if ('string' == typeof fn) {
    slug = text;
    text = fn;
    fn = arguments[2];
  } else {
    slug = createSlug(text);
  }

  var self = this;
  var el = domify('<li class="menu-item-' + slug + '">' +
                    '<a href="#">' + text + '</a>' +
                  '</li>');

  var links = query.all('a', el);
  for (var i = 0; i < links.length; i++) {
    event.bind(links[i], 'click', onclick);
  }

  function onclick(e){
    e.preventDefault();
    e.stopPropagation();
    self.hide();
    self.emit('select', slug);
    self.emit(slug);
    fn && fn();
  }

  this.el.appendChild(el);
  this.items[slug] = el;
  return this;
};

/**
 * Remove menu item with the given `slug`.
 *
 * @param {String} slug
 * @return {Menu}
 * @api public
 */

Menu.prototype.remove = function(slug){
  var item = this.items[slug] || this.items[createSlug(slug)];
  if (!item) throw new Error('no menu item named "' + slug + '"');
  this.emit('remove', slug);
  this.el.removeChild(item);
  delete this.items[slug];
  delete this.items[createSlug(slug)];
  return this;
};

/**
 * Clear all the items from the menu
 *
 * @return {Menu}
 * @api public
 */

Menu.prototype.clear = function(){
  empty(this.el);
  this.items = {};
  this.emit('clear');
  return this;
};

/**
 * Check if this menu has an item with the given `slug`.
 *
 * @param {String} slug
 * @return {Boolean}
 * @api public
 */

Menu.prototype.has = function(slug){
  return !! (this.items[slug] || this.items[createSlug(slug)]);
};

/**
 * Move context menu to `(x, y)`.
 *
 * @param {Number} x
 * @param {Number} y
 * @return {Menu}
 * @api public
 */

Menu.prototype.moveTo = function(x, y){
  this.el.style.top = y;
  this.el.style.left = x;
  return this;
};

/**
 * Show the menu.
 *
 * @return {Menu}
 * @api public
 */

Menu.prototype.show = function(){
  this.el.style.display = 'block';
  this.emit('show');
  return this;
};

/**
 * Hide the menu.
 *
 * @return {Menu}
 * @api public
 */

Menu.prototype.hide = function(){
  this.el.style.display = 'none';
  this.emit('hide');
  return this;
};

/**
 * Generate a slug from `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function createSlug(str) {
  return String(str)
    .toLowerCase()
    .replace(/ +/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
