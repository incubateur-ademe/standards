import { Container } from "@/dsfr";
import { DsfrPage } from "@/dsfr/layout/DsfrPage";

const AdminPage = () => {
  return (
    <DsfrPage>
      <Container fluid py="4w" px="2w">
        <h1>Configuration – Admin</h1>
        {/* <AdminConfigForm initialConfig={gistConfig} /> */}
      </Container>
    </DsfrPage>
  );
};

export default AdminPage;
