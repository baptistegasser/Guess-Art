# Utilisation de Redux

Redux permet de stocker des états qui peuvent être accéder sans avoir besoin de remonter plusieurs parents ou descendre une info à travers tous les enfants.

Etapes pour créer un nouvel états:

## 1) Definir les données à conserver dans l'état

On va stocker utilisateurs, ainsi on va par la suite utiliser `user` pour les fichiers, noms, etc.
Pour les données on aura:

```json
{
  username: bob,
  score: 0
}
```

## 2) Créer nos actions

Les actions permettent de définir les actions possible sur les données.

Format d'une action:

```js
export const action_name = data => {
    return {
        type: 'ACTION_TO_DO',
        payload: data
    }
};
```

On a le `type` qui est une `string` est sera utilisé pour différencié les différentes actions plus tard.
La partie `payload` permet de stocker des données variables (ie: on pourra passer un int utilisé pour incrémenter notre état).

------------------------------

Dans le cadre de notre exemple:
Créer un nouveau fichier `user.js` dans le dossier `store/actions`.
Le fichier contient:

```js
export const set_username = username => {
    return {
        type: 'SET_USERNAME',
        payload: username
    }
};

export const increment_score = amount => {
    return {
        type: 'INCREMENT_SCORE',
        payload: amount
    }
};
```

Pour pouvoir appeler plus tard nos actions, on met à jour le fichier `store/actions/index.js`.
On y rajoute la ligne suivante pour exposer toutes nos actions:
`export * from './user.js';`

## 3) Créer nôtre Réducteur

Les réducteurs permettent de créer la logique à appliquer pour les actions définis précédemment
Format d'un réducteur:

```js
const nameReducer = (state = default_value, action) => {
    switch(action.type) {
        case: 'ACTION_TO_DO':
            /*Faire ce que vous avez besoin*/
            state.val = new_val
            break;
        default:
            return state;
    }
}
```

------------------------------

Dans le cadre de notre exemple:
Créer un nouveau fichier `user.js` dans le dossier `store/reducers`.
Le fichier contient:

```js
const userReducer = (state = { username: '', score: 0 }, action) => {
    switch(action.type) {
        case 'SET_USERNAME':
            state.username = payload;
            return state;
        case 'INCREMENT_SCORE':
            state.score = payload;
            return state;
        default:
            return state;
    }
}

export default userReducer;
```

On va maintenant mettre à jour le fichier `store/reducers/index.js`:
On ajoute l'import de notre fichier fraichement créer: `import userReducer from './user'`
Et enfin on l'ajoute à la liste des reducteurs à combiner:
Tel que:
**Avant**

```js
const rootReducer = combineReducers({
    isLogged: loggedReducer
})
```

**Après**

```js
const rootReducer = combineReducers({
    isLogged: loggedReducer,
    user: userReducer
})
```

**Et voilà !** Notre état est maintenant stocké dans Redux. On doit maintenant définir comment y accéder dans React.

## 4) Accéder à notre états

On souhaite maintenant que notre composant puisse accéder à notre état via ses `props`.
Pour cela on doit définir les états que l'application souhaite lire ainsi que les actions qu'elles souhaite pouvoir éxecuter.

Le format est le suivant:

```js
import { connect } from 'react-redux';

// Map des états Redux à lier au props du composant React
const mapStateToProps = state => ({
    user: state.user
});

// Map des actions qui peuvent être utilisé par notre composant
const mapDispatchToProps = () => {
    return {
        set_reducer, increment_score
    };
};

// mon component
class MyComponent extends React.Component {
    render() {
        <h1>Pseudo: {this.props.user.pseudo}</h1>
        <h2>Score: {this.props.user.score}</h2>
        <Button onClick={() => this.props.increment_score(5)}>Increment by 5</Button>
    }
}

// On combine notre composant et les maps
export default connect(
    mapStateToProps,
    mapDispatchToProps()
)(MyComponent);

```

## Conclusion

Et voilà, notre état est stocké dans notre store Redux et notre component peux accéder à cet valeur via ses props.
De plus si la valeur est mis à jour par un autre élément (ie: l'enfant d'un enfant d'un enfant d'un ...) il sera automatiquement mis à jour pour notre component !
