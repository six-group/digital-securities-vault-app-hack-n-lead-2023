import { Grid, GridItem } from "@chakra-ui/react";
import { Footer, Header } from "../components";
import { Home } from "../views";

export default function IndexPage() {
  return (
    <>
      <Grid
        templateAreas={`"header"
                  "main"
                  "footer"`}
        gridTemplateRows={"50px 1fr 30px"}
        h="100vh"
        gap="1"
        color="blackAlpha.900"
      >
        <GridItem
          pl="2"
          color="whiteAlpha.900"
          bg="blackAlpha.800"
          area={"header"}
        >
          <Header />
        </GridItem>
        <GridItem pl="2" bg="gray.50" area={"main"}>
          <Home />
        </GridItem>
        <GridItem
          pl="2"
          color="whiteAlpha.900"
          bg="blackAlpha.800"
          area={"footer"}
        >
          <Footer />
        </GridItem>
      </Grid>
    </>
  );
}
