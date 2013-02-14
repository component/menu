
/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , dom     = require('dom')

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
  if (!(this instanceof Menu)) return new Menu;
  Emitter.call(this);
  this.items = {};
  this.el = dom('<ul class=menu>').css('display','none');
  document.body.appendChild(this.el.get(0));
  this.el.on('hover', this.deselect.bind(this));
  document.getElementsByTagName('html')[0].onclick = this.hide.bind(this);
  this.on('show', this.bindKeyboardEvents.bind(this));
  this.on('hide', this.unbindKeyboardEvents.bind(this));
}

/**
 * Inherit from `Emitter.prototype`.
 */

Menu.prototype = new Emitter;

/**
 * Deselect selected menu items.
 *
 * @api private
 */

Menu.prototype.deselect = function(){
  this.el.find('.selected').removeClass('selected');
};

/**
 * Bind keyboard events.
 *
 * @api private
 */

Menu.prototype.bindKeyboardEvents = function(){
  dom(document).on('keydown', this._fnKeyDown = this.onkeydown.bind(this));
  return this;
};

/**
 * Unbind keyboard events.
 *
 * @api private
 */

Menu.prototype.unbindKeyboardEvents = function(){
  if (this._fnKeyDown) dom(document).off('keydown', this._fnKeyDown);
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
  var prev = this.el.find('.selected');

  var next = prev.length()
    ? prev.get(0)[direction + 'ElementSibling']
    : this.el.find('li:first-child').get(0);

  next = next ? dom(next) : dom([]);
  if (next.length()) {
    prev.removeClass('selected');
    next.addClass('selected');
    next.find('a').get(0).focus();
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

  var self = this
    , el = dom('<li><a href="#">' + text + '</a></li>')
             .addClass('menu-item-' + slug)

  el.find('a')
    .on('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      self.hide();
      self.emit('select', slug);
      self.emit(slug);
      fn && fn();
    });

  this.el.get(0).appendChild(el.get(0));
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
  this.el.get(0).removeChild(item.get(0));
  delete this.items[slug];
  delete this.items[createSlug(slug)];
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
  this.el.css('top', y).css('left',x);
  return this;
};

/**
 * Show the menu.
 *
 * @return {Menu}
 * @api public
 */

Menu.prototype.show = function(){
  this.emit('show');
  this.el.css('display','block');
  return this;
};

/**
 * Hide the menu.
 *
 * @return {Menu}
 * @api public
 */

Menu.prototype.hide = function(){
  this.emit('hide');
  this.el.css('display','none');
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


