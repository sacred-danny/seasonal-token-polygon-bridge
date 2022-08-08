import { Select, MenuItem, FormControl } from "@material-ui/core";
import { MenuProps as MenuPropsType } from "@material-ui/core/Menu";
import { makeStyles } from '@material-ui/core/styles';

import { SeasonalTokens } from "../core/constants/base";

const useStyles = makeStyles({
    select: {
        "& ul": {
            backgroundColor: "#cccccc",
        },
        "& li": {
            fontSize: 12,
        },
    },
});
export const BscTokenSection = (props: any):JSX.Element => {

  const tokenInputStyle = 'w-full bg-charCoal text-stormDust text-18 font-medium border-1 border-limedSqruce rounded-10 py-12 px-20 shadow-tokenOption outline-none appearance-none';
  const seasonOptionStyle = 'flex justify-between items-center w-full text-white text-18 font-medium border-1 border-limedSqruce py-12 px-20';
  const selectMenuProps: Partial<MenuPropsType> = {
    variant: 'menu',
    anchorOrigin: { vertical: "bottom", horizontal: "left" },
    transformOrigin: { vertical: "top", horizontal: "left" },
    getContentAnchorEl: null,
  };

  return (
    <div className="w-full">
      <FormControl variant="standard" className="w-full">
        <label className="text-artySkyBlue font-18 font-medium leading-1.5em">Token Select</label>
        <Select onChange={props.onChange} id="bsc-season" className="p-0" value={props.season} MenuProps={selectMenuProps} disableUnderline>
          {
            Object.keys(SeasonalTokens).map((season, index:number) => {
              return <MenuItem value={season} key={index}>
                <div className={seasonOptionStyle}>
                  <div className="flex items-center pr-20">
                    <img src={SeasonalTokens[season].img} className="w-30 h-30" alt={season}/>
                    <label className="mx-20">{season}</label>
                  </div>
                  <label className="mr-20 overflow-hidden">{parseFloat(props.tokenAmounts[season].bscAmount).toLocaleString('en-US', { maximumFractionDigits: 2 })}</label>
                </div>
              </MenuItem>;
            })
          }
        </Select>
        <label className="text-artySkyBlue font-18 font-medium mt-20">Token Amount</label>
        <input className={tokenInputStyle} value={props.swapAmount} type="number" onChange={props.onSwapAmountChange}/>
      </FormControl>
    </div>
  );
}