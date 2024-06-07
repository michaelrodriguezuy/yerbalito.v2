import { AreaChartCuotas } from "../../layout/reports/Cuotas";
import { AreaChartFC } from "../../layout/reports/Fc";
import { BarListCantxCategoria } from "../../layout/reports/CantidadesXcat";
import { BarChartCuotasYfcXcategoria } from "../../layout/reports/CyFCxCat";
import { Card } from "@tremor/react";

const Reports = () => {
  return (
    <div
      className="container "
      style={{
        textAlign: "center",
        maxHeight: "100vh",
        overflowY: "auto",
      }}
    >
      Reportes
      <div className="grid grid-cols-2 mt-10 m-20 gap-6">
        <Card>
          <div className="col-span-1 px-7">
            <AreaChartCuotas />
          </div>
        </Card>

        <Card>
          <div className="col-span-1 px-7">
            <AreaChartFC />
          </div>
        </Card>
        <Card>
          <div className="col-span-1 px-7">
            <BarListCantxCategoria />
          </div>
        </Card>
        <Card>
          <div className="col-span-1 px-7">
            <BarChartCuotasYfcXcategoria />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
