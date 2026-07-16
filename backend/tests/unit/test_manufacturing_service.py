import pytest
from decimal import Decimal
from datetime import datetime

from app.services.manufacturing_service import ManufacturingService

class MockBOMItem:
    def __init__(self, product_id, quantity, scrap_percentage=0.0):
        self.component_product_id = product_id
        self.component_variant_id = None
        self.quantity = Decimal(str(quantity))
        self.uom_id = 1
        self.scrap_percentage = Decimal(str(scrap_percentage))
        self.notes = "Test item"

class MockBOM:
    def __init__(self, quantity=1.0, items=None):
        self.quantity = Decimal(str(quantity))
        self.items = items or []

class MockBOMRepo:
    @staticmethod
    def get_by_id(db, bom_id):
        if bom_id == 1:
            return MockBOM(1.0, [
                MockBOMItem(10, 2.0),
                MockBOMItem(11, 1.5, 10.0) # 10% scrap
            ])
        return None

def test_explode_bom(monkeypatch):
    monkeypatch.setattr("app.repositories.manufacturing_repository.BillOfMaterialsRepository.get_by_id", MockBOMRepo.get_by_id)

    # Explode BOM ID 1 for quantity 10
    result = ManufacturingService.explode_bom(db=None, bom_id=1, quantity=Decimal("10.0"))

    assert len(result) == 2

    # Item 10: base qty 2.0 * 10 = 20.0
    item1 = next(i for i in result if i["product_id"] == 10)
    assert item1["required_quantity"] == Decimal("20.0")

    # Item 11: base qty 1.5 * 10 = 15.0 / (1 - 0.10) = 15.0 / 0.9 = 16.666...
    item2 = next(i for i in result if i["product_id"] == 11)
    # allow small precision diff
    assert abs(item2["required_quantity"] - Decimal("16.6666")) < Decimal("0.0001")
