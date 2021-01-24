import { find } from 'lodash'

export default class CollectionModel {
  constructor(data) {
    this.raw = data;
    this.id = data.info._postman_id;
    this.name = data.info.name;
  }

  get items() {
    return this.raw.item;
  }

  get variables() {
    return this.raw.variable;
  }

  getItemById(id) {
    return find(this.items, (item) => item._postman_id === id)
  }

  addItem(item) {
    this.raw.item.push(item);
  }

  getVariableById(id) {
    return find(this.variables, (variable) => variable.key === id)
  }

  addVariable(item) {
    this.raw.variable.push(item);
  }

  toJSON() {
    return this.raw;
  }
}
