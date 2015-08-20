import Ember from 'ember';

export default Ember.Mixin.create({
  init() {
    this._super(...arguments);

    this.fooClass = this.prefixClass('foo');
    this.barClass = this.prefixClass('bar');

    // this will affect yield
    this.classNames.push(this.componentStyle.prefix);
  },
  _appendComponentStyle: Ember.on('willInsertElement', function () {
    this.componentStyle.append();
  }),
  _removeComponentStyle: Ember.on('willDestroyElement', function () {
    this.componentStyle.remove();
  }),
  prefixClass(className) {
    return this.componentStyle.prefixClass(className);
  }
});
