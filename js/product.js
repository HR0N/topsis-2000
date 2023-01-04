class Product {
    constructor(index) {
        this.index = index;
        this.data = {
            index:          null,
            name:           null,
            protein:        null,
            fats:           null,
            carbohydrates:  null,
            calories:       null,
            price_weight:   null,
        };
        this.prod = `<div class="input-group group group-${this.index}">
        <div class="delete">X</div>
        <div class="group-title">Продукт №${this.index}</div>
        <label>Назва
            <input class="form-control" type="text" min="0" name="name">
        </label>
        <label>Білки
            <input class="form-control" type="number" min="0" name="protein" required>
        </label>
        <label>Жири
            <input class="form-control" type="number" min="0" name="fats">
        </label>
        <label>Вуглеводи
            <input class="form-control" type="number" min="0" name="carbohydrates">
        </label>
        <label>Калорії
            <input class="form-control" type="number" min="0" name="calories">
        </label>
        <label>Ціна <em>(шт)</em>
            <input class="form-control" type="number" min="0" name="price">
        </label>
        <label>Вага <em>(грам)</em>
            <input class="form-control" type="number" min="0" name="weight">
        </label>
        <label>Ціна \\ 100 грам
            <input class="form-control" type="number" name="price_weight" disabled>
        </label>
    </div>`;
        this.prod_blank = `<div class="prod-blank">
                <div class="prod-blank__buttons">
                    <div class="btn btn-outline-success">Добавить</div>
                </div>
            </div>`;
    }
    setData = (data) => this.data = data;

    getData = () => this.data;
    getProduct = () => this.prod;
    getProductBlank = () => this.prod_blank;
}
