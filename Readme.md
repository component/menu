
# Menu

  Menu component with structural styling to give you a clean slate.

  ![js menu component](http://f.cl.ly/items/1Z1d3B1j283y3e200g3E/Screen%20Shot%202012-07-31%20at%203.57.10%20PM.png)

## Installation

```
$ npm install menu-component
```

## Features

  - events for composition
  - structural CSS letting you decide on style
  - fluent API
  - arrow key navigation

## Events

  - `show` when shown
  - `hide` when hidden
  - `remove` (item) when an item is removed
  - `select` (item) when an item is selected
  - `*` menu item events are emitted when clicked

## Example

```js
var Menu = require('menu');

var menu = new Menu;

menu
.add('Add item')
.add('Edit item', function(){ console.log('edit'); })
.add('Remove item', function(){ console.log('remove'); })
.add('Remove "Add item"', function(){
  menu.remove('Add item');
  menu.remove('Remove "Add item"');
});

menu.on('select', function(item){
  console.log('selected "%s"', item);
});

menu.on('Add item', function(){
  console.log('added an item');
});

oncontextmenu = function(e){
  e.preventDefault();
  menu.moveTo(e.pageX, e.pageY);
  menu.show();
};
```

## API
  
### Menu()

  Create a new `Menu`:

```js
var Menu = require('menu');
var menu = new Menu();
var menu = Menu();
```

### Menu#add([slug], text, [fn])

  Add a new menu item with the given `text`, optional `slug` and callback `fn`.

  Using events to handle selection:

```js
menu.add('Hello');

menu.on('Hello', function(){
  console.log('clicked hello');
});
```

  Using callbacks:

```js
menu.add('Hello', function(){
  console.log('clicked hello');
});
```

  Using a custom slug, otherwise "hello" is generated
  from the `text` given, which may conflict with "rich"
  styling like icons within menu items, or i18n.

```js
menu.add('add-item', 'Add Item');

menu.on('add-item', function(){
  console.log('clicked "Add Item"');
});

menu.add('add-item', 'Add Item', function(){
  console.log('clicked "Add Item"');
});
```

### Menu#remove(slug)

  Remove an item by the given `slug`:

```js
menu.add('Add item');
menu.remove('Add item');
```

  Or with custom slugs:

```js
menu.add('add-item', 'Add item');
menu.remove('add-item');
```

### Menu#has(slug)

  Check if a menu item is present.

```js
menu.add('Add item');

menu.has('Add item');
// => true

menu.has('add-item');
// => true

menu.has('Foo');
// => false
```

### Menu#moveTo(x, y)

  Move the menu to `(x, y)`.

### Menu#show()

  Show the menu.

### Menu#hide()

  Hide the menu.

## License

  MIT