class Topsis {
    constructor(elem, topsis, Matrix, m, w, ia) {
        this.el = $(elem);
        this.Topsis = topsis;
        this.Matrix = Matrix;
        this.m = m;
        this.w = w;
        this.ia = ia;
        this.ia_v2 = ['max', 'max', 'max', 'max', 'min'];

        this.product = new Product();
        this.products_container = this.el.find('.products-container .products');
        this.output_html = this.el.find('.output-data');
        this.products = [new Product(1), new Product(2)];

        this.btn_add = null;
        this.btn_delete = null;
        this.btn_count = this.el.find('.products-container .count');
        this.products_price = null;
        this.products_weight = null;

        this.products_list = null;

        this.product_names = null;
        this.product_proteins = null;
        this.product_fats = null;
        this.product_carbohydrates = null;
        this.product_calories = null;
        this.product_price_weights = null;

        this.criterion_weight = this.el.find('.criterion_weight');
        this.criterion_inputs = this.criterion_weight.find('input');
        this.criterion_protein = this.criterion_weight.find('input[name="protein"]');
        this.criterion_fats = this.criterion_weight.find('input[name="fats"]');
        this.criterion_carbohydrates = this.criterion_weight.find('input[name="carbohydrates"]');
        this.criterion_calories = this.criterion_weight.find('input[name="calories"]');
        this.criterion_price_weight = this.criterion_weight.find('input[name="price_weight"]');

        this.criterion_checkbox_protein = this.criterion_weight.find('input[name="protein_check"]');
        this.criterion_checkbox_fats = this.criterion_weight.find('input[name="fats_check"]');
        this.criterion_checkbox_carbohydrates = this.criterion_weight.find('input[name="carbohydrates_check"]');
        this.criterion_checkbox_calories = this.criterion_weight.find('input[name="calories_check"]');
        this.criterion_checkbox_price_weight = this.criterion_weight.find('input[name="price_weight_check"]');

        this.events();
    }

    getWeightIndicates(){
        return [
            Number(this.criterion_protein.val()),
            Number(this.criterion_fats.val()),
            Number(this.criterion_carbohydrates.val()),
            Number(this.criterion_calories.val()),
            Number(this.criterion_price_weight.val()),
        ];
    }

    createHash(arr){
        let hash = {};
        for(let i = 0 ; i < arr.length; i += 1) {
            hash[arr[i]] = i;
        }
        return hash;
    }

    getMatrix(){
        let arrays = this.products.map((v1, k1)=>{
            return Object.keys(v1.data).map((v2, k2)=>{
                return v1.getData()[v2];
            });
        });
        arrays.map((v, k)=>{
            return v.splice(0, 2);
        });
        return arrays;
    }

    getIA(){
        return [
            this.criterion_checkbox_protein.prop('checked') ? 'max' : 'min',
            this.criterion_checkbox_fats.prop('checked') ? 'max' : 'min',
            this.criterion_checkbox_carbohydrates.prop('checked') ? 'max' : 'min',
            this.criterion_checkbox_calories.prop('checked') ? 'max' : 'min',
            this.criterion_checkbox_price_weight.prop('checked') ? 'max' : 'min',
        ];
    }

    setData(e){
        let group = $(e.target).parent().parent();
        let index = group.index() - 1;
        let data = {
            index:          index,
            name:           $(group).find('input[name="name"]').val(),
            protein:        Number($(group).find('input[name="protein"]').val()),
            fats:           Number($(group).find('input[name="fats"]').val()),
            carbohydrates:  Number($(group).find('input[name="carbohydrates"]').val()),
            calories:       Number($(group).find('input[name="calories"]').val()),
            price_weight:   Number($(group).find('input[name="price_weight"]').val()),
        };
        this.products[index].setData(data);
    }

    getProductsList(){this.products_list = this.el.find('.group');}

    newProduct(){
        this.getProductsList();
        if(this.products_list.length < 10){
            let index = this.products_list.length + 1;
            this.products.push(new Product(index));
            this.appendProduct();
        }
    }
    appendProduct(){
        this.products_container.append(this.products[this.products.length - 1].getProduct());
        this.btn_add.remove();
        if(this.products_list.length < 9){
            this.products_container.append(this.product.getProductBlank());
        }
        let index = this.products_list.length + 1;
        let product = this.el.find(`.group-${index} .delete`);
        this.setEvents(product, 'click', this.deleteProduct);
        this.loadInterface();
        this.setEvents(this.btn_add.find('.btn'), 'click', this.newProduct);
    }
    appendProducts(){
        this.products.map((v, k)=>{
            this.products_container.append(v.getProduct());
        });
        let product_1 = this.el.find(`.group-${1} .delete`);
        let product_2 = this.el.find(`.group-${2} .delete`);
        this.setEvents(product_1, 'click', this.deleteProduct);
        this.setEvents(product_2, 'click', this.deleteProduct);

        this.products_container.append(this.product.getProductBlank());
    }

    deleteProduct(e){
        let parent = $(e.target).parent();
        let index = parent.index() - 1;
        this.getProductsList();
        if(this.products_list.length === 10){
            this.btn_add.remove();
            this.products_container.append(this.product.getProductBlank());
        }else{
            this.refreshAddButton();
        }
        parent.remove();
        this.products.splice(index, 1);
        this.loadInterface();
        this.setEvents(this.btn_add.find('.btn'), 'click', this.newProduct);
    }

    countPriceAndWeight(e){
        let cur_group = $(e.target).parent().parent();
        let cur_price = cur_group.find('input[name="price"]').val();
        let cur_weight = cur_group.find('input[name="weight"]').val();
        let cur_average = cur_group.find('input[name="price_weight"]');
        if(+cur_price > 0 && +cur_weight > 0){
            cur_average.val(this.get100grPrice(cur_weight, cur_price));
            this.setData(e);
        }
    }
    get100grPrice(weight, price){
        return Number(+price * 100 / +weight).toFixed(2);
    }
    checkCriterionSum(e){
        let sum = Number(+this.criterion_protein.val() + +this.criterion_fats.val()
            + +this.criterion_carbohydrates.val() + +this.criterion_calories.val() + +this.criterion_price_weight.val());
        if(sum > 1){
            let preventValue = (1 - (sum - +$(e.target).val())).toFixed(2);
            $(e.target).val(preventValue);
        }
    }

    refreshAddButton(){
        this.btn_add.remove();
        this.products_container.append(this.product.getProductBlank());
    }

    loadInterface(){
        this.btn_add = this.el.find('.prod-blank');
        this.btn_delete = this.el.find('.delete');
        this.products_price = this.el.find('.group input[name="price"]');
        this.products_weight = this.el.find('.group input[name="weight"]');
        this.product_names = this.el.find('.group input[name="name"]');
        this.product_proteins = this.el.find('.group input[name="protein"]');
        this.product_fats = this.el.find('.group input[name="fats"]');
        this.product_carbohydrates = this.el.find('.group input[name="carbohydrates"]');
        this.product_calories = this.el.find('.group input[name="calories"]');
        this.product_price_weights = this.el.find('.group input[name="price_weight"]');

        this.reloadEvents();
    }


    onLoad(){
        this.appendProducts();
    }

    setEvents(elem, events, cb){
        elem.off(events, cb.bind(this));
        elem.on(events, cb.bind(this));
    }

    reloadEvents(){
        this.setEvents(this.products_weight, 'change, input', this.countPriceAndWeight);
        this.setEvents(this.products_price, 'change, input', this.countPriceAndWeight);
        this.setEvents(this.product_names, 'change, input', this.setData);
        this.setEvents(this.product_proteins, 'change, input', this.setData);
        this.setEvents(this.product_fats, 'change, input', this.setData);
        this.setEvents(this.product_carbohydrates, 'change, input', this.setData);
        this.setEvents(this.product_calories, 'change, input', this.setData);
        this.setEvents(this.product_price_weights, 'change, input', this.setData);
    }

    countTopsis(){
        let matrix = this.getMatrix();
        let hash = this.createHash(matrix);
        matrix = new this.Matrix(matrix);
        let weights = this.getWeightIndicates();
        let ia = this.getIA();

        console.log(ia);

        let key = this.Topsis.getBest(matrix, weights, ia);
        let index = hash[key];

        this.display_result(index);
    }

    display_result(idx){
            let product = this.products[idx];
            let index = product.getData().index;
            let name = product.getData().name;
            let order = `<div class="order">Продукт №${index + 1}${name ? " - "+name : ''}</div>`;
            $(this.output_html).find('.order').remove();
            $(this.output_html).append(order);
    }

    events(){
        this.onLoad();
        this.loadInterface();

        this.setEvents(this.criterion_inputs, 'change, input', this.checkCriterionSum);
        this.setEvents(this.btn_add.find('.btn'), 'click', this.newProduct);
        this.setEvents(this.btn_count, 'click', this.countTopsis);
    }
}