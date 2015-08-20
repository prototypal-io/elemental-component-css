import Ember from 'ember';
import ComponentStyleMixin from 'elemental-component-css/mixins/component-style';

Ember.ComponentLookup.reopen({
  componentFor(name, container) {
    var factory = this._super(...arguments);
    var fullName = 'component:' + name;
    var styleFullName = 'style:components/' + name;

    if (!ComponentStyleMixin.detect(factory.PrototypeMixin)) {
      factory.reopen(ComponentStyleMixin, {
        componentStyle: container.lookup(styleFullName)
      });
    }

    return factory;
  }
});
