import Ember from 'ember';
import ComponentStyleMixin from 'elemental-component-css/mixins/component-style';

Ember.ComponentLookup.reopen({
  componentFor(name, container) {
    var factory = this._super(...arguments);
    var styleFullName = 'style:components/' + name;
    var componentStyle = container.lookup(styleFullName);
    if (!ComponentStyleMixin.detect(factory.PrototypeMixin)) {
      factory.reopen(ComponentStyleMixin, {
        componentStyle: container.lookup(styleFullName),
        classNames: [componentStyle.componentClass],
        classes: componentStyle.classes
      });
    }
    return factory;
  }
});
