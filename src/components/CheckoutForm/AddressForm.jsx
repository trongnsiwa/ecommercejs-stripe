import React, { useState, useEffect } from "react";
import {
   InputLabel,
   Select,
   MenuItem,
   Button,
   Grid,
   Typography,
} from "@material-ui/core";
import { useForm, FormProvider } from "react-hook-form";
import { Link } from "react-router-dom";
import { commerce } from "../../lib/commerce";

import FormInput from "./FormInput";

const AddressForm = ({ checkoutToken, next }) => {
   const [shippingCountries, setShippingCountries] = useState([]);
   const [shippingCountry, setShippingCountry] = useState("");
   const [shippingSubdivisions, setShippingSubdivisions] = useState([]);
   const [shippingSubdivision, setShippingSubdivision] = useState("");
   const [shippingOptions, setShippingOptions] = useState([]);
   const [shippingOption, setShippingOption] = useState("");
   const methods = useForm();

   const countries = Object.entries(shippingCountries).map(([code, name]) => ({
      id: code,
      label: name,
   }));
   const subdivisions = Object.entries(shippingSubdivisions).map(
      ([code, name]) => ({
         id: code,
         label: name,
      })
   );
   const options = shippingOptions.map((sO) => ({
      id: sO.id,
      label: `${sO.description} = (${sO.price.formatted_with_symbol})`,
   }));

   useEffect(() => {
      let isCancelled = false;

      const fetchShippingCountries = async (checkoutTokenId) => {
         if (!isCancelled) {
            const { countries } =
               await commerce.services.localeListShippingCountries(
                  checkoutTokenId
               );

            setShippingCountries(countries);
            setShippingCountry(Object.keys(countries)[0]);
         }
      };

      fetchShippingCountries(checkoutToken.id);

      return () => {
         isCancelled = true;
      };
   }, [checkoutToken.id]);

   useEffect(() => {
      let isCancelled = false;

      const fetchSubdivisions = async (countryCode) => {
         if (!isCancelled) {
            const { subdivisions } =
               await commerce.services.localeListSubdivisions(countryCode);

            setShippingSubdivisions(subdivisions);
            setShippingSubdivision(Object.keys(subdivisions)[0]);
         }
      };

      if (shippingCountry) fetchSubdivisions(shippingCountry);

      return () => {
         isCancelled = true;
      };
   }, [shippingCountry]);

   useEffect(() => {
      let isCancelled = false;

      const fetchShippingOptions = async (
         checkoutTokenId,
         country,
         region = null
      ) => {
         if (!isCancelled) {
            const options = await commerce.checkout.getShippingOptions(
               checkoutTokenId,
               {
                  country,
                  region,
               }
            );

            setShippingOptions(options);
            setShippingOption(options[0].id);
         }
      };
      if (shippingSubdivision)
         fetchShippingOptions(
            checkoutToken.id,
            shippingCountry,
            shippingSubdivision
         );

      return () => {
         isCancelled = true;
      };
   }, [shippingSubdivision, checkoutToken.id, shippingCountry]);

   return (
      <>
         <Typography variant="h6" gutterBottom>
            Shipping Address
         </Typography>
         <FormProvider {...methods}>
            <form
               onSubmit={methods.handleSubmit((data) =>
                  next({
                     ...data,
                     shippingCountry,
                     shippingSubdivision,
                     shippingOption,
                  })
               )}
            >
               <Grid container spacing={3}>
                  <FormInput name="firstName" label="First name" />
                  <FormInput name="lastName" label="Last name" />
                  <FormInput name="address" label="Address" />
                  <FormInput name="email" label="Email" />
                  <FormInput name="city" label="City" />
                  <FormInput name="zip" label="ZIP / Postal code" />
                  <Grid item xs={12} sm={6}>
                     <InputLabel>Shipping Country</InputLabel>
                     <Select
                        value={shippingCountry}
                        fullWidth
                        onChange={(e) => setShippingCountry(e.target.value)}
                     >
                        {countries.map((country) => (
                           <MenuItem key={country.id} value={country.id}>
                              {country.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <InputLabel>Shipping Subdivision</InputLabel>
                     <Select
                        value={shippingSubdivision}
                        fullWidth
                        onChange={(e) => setShippingSubdivision(e.target.value)}
                     >
                        {subdivisions.map((subdivision) => (
                           <MenuItem
                              key={subdivision.id}
                              value={subdivision.id}
                           >
                              {subdivision.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                     <InputLabel>Shipping Options</InputLabel>
                     <Select
                        value={shippingOption}
                        fullWidth
                        onChange={(e) => setShippingOption(e.target.value)}
                     >
                        {options.map((option) => (
                           <MenuItem key={option.id} value={option.id}>
                              {option.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </Grid>
               </Grid>
               <br />
               <div
                  style={{ display: "flex", justifyContent: "space-between" }}
               >
                  <Button component={Link} to="/cart" variant="outlined">
                     Back to Cart
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                     Next
                  </Button>
               </div>
            </form>
         </FormProvider>
      </>
   );
};

export default AddressForm;
