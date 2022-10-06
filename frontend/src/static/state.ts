
import { createStore } from 'state-pool';

const store = createStore();  // Create store for storing our global state
store.setState("transactions", []);

export default store;