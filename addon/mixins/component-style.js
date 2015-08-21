import Ember from 'ember';

export default Ember.Mixin.create({
  _appendComponentStyle: Ember.on('willInsertElement', function () {
    this.componentStyle.append();
  }),
  _removeComponentStyle: Ember.on('willDestroyElement', function () {
    this.componentStyle.remove();
  })
});
