using { wb } from '../db/data-models';

service ProdMan {

    entity Products as projection on wb.Products;
    entity Categories as projection on wb.Categories;
}