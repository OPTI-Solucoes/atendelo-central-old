// $(document).ready(function() {

Vue.component('menu-vertical', {
	template: $.readFile('templates/menu/menu.html'),

	data: function() {
		var rc_data = {
			drawer: null,

		};
		return rc_data;
	},

	mounted: function() {
		var self = this;
		mdc.autoInit()

		var drawerEl = document.querySelector('.mdc-temporary-drawer');
		var MDCTemporaryDrawer = mdc.drawer.MDCTemporaryDrawer;
		self.drawer = new MDCTemporaryDrawer(drawerEl);
		document.querySelector('.demo-menu').addEventListener('click', function() {
			self.drawer.open = true;
		});
		drawerEl.addEventListener('MDCTemporaryDrawer:open', function() {
		// console.log('Received MDCTemporaryDrawer:open');
		});
		drawerEl.addEventListener('MDCTemporaryDrawer:close', function() {
		// console.log('Received MDCTemporaryDrawer:close');
		});
	},

	methods: {

	},
});


	

